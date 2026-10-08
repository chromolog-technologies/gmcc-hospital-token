<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportPatientsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(protected string $filePath) {}

    /**
     * Execute the job (queued context).
     */
    public function handle(): void
    {
        $this->process();
    }

    /**
     * Process the import synchronously and return summary details.
     */
    public function process(): array
    {
        @set_time_limit(300);
        @ini_set('max_execution_time', '300');
        @ini_set('memory_limit', '512M');
        if (function_exists('ignore_user_abort')) {
            @ignore_user_abort(true);
        }

        if (!file_exists($this->filePath)) {
            Log::error("Import file not found: {$this->filePath}");
            return ['imported' => 0, 'skipped' => 0, 'error' => 'Import file not found'];
        }

        $handle = fopen($this->filePath, 'r');
        if ($handle === false) {
            Log::error("Failed to open import file: {$this->filePath}");
            return ['imported' => 0, 'skipped' => 0, 'error' => 'Failed to open import file'];
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return ['imported' => 0, 'skipped' => 0, 'error' => 'CSV file header is empty'];
        }

        // Strip UTF-8 BOM if present
        $header[0] = preg_replace('/[\x{FEFF}\x{FFFE}]/u', '', $header[0]);
        $header[0] = str_replace("\xEF\xBB\xBF", '', $header[0]);
        $header = array_map(fn($col) => strtolower(trim($col)), $header);

        // Map column index to canonical column name
        $headerMap = [];
        foreach ($header as $idx => $colName) {
            if (in_array($colName, ['crno', 'cr_number', 'cr number', 'cr_no', 'cr'])) {
                $headerMap['crno'] = $idx;
            } elseif (in_array($colName, ['name', 'patient_name', 'patient name'])) {
                $headerMap['name'] = $idx;
            } elseif (in_array($colName, ['user_age', 'age'])) {
                $headerMap['user_age'] = $idx;
            } elseif (in_array($colName, ['user_gender', 'gender'])) {
                $headerMap['user_gender'] = $idx;
            }
        }

        if (!isset($headerMap['crno']) || !isset($headerMap['name'])) {
            fclose($handle);
            Log::error("CSV import missing required crno or name column.");
            return ['imported' => 0, 'skipped' => 0, 'error' => 'CSV import missing required crno or name column'];
        }

        $batch = [];
        $now = now()->toDateTimeString();
        $existingCrnos = User::pluck('crno')->flip()->all();
        $insertedCount = 0;
        $skippedCount = 0;
        $errorMessage = null;

        // Pre-hash default password once outside the loop to avoid expensive bcrypt per row
        $defaultPasswordHash = Hash::make('12345678');

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                if (count(array_filter($row, fn($v) => trim($v) !== '')) === 0) {
                    continue;
                }

                $name = isset($headerMap['name']) && isset($row[$headerMap['name']]) ? trim($row[$headerMap['name']]) : '';
                $rawCrno = isset($headerMap['crno']) && isset($row[$headerMap['crno']]) ? trim($row[$headerMap['crno']]) : '';
                $age = isset($headerMap['user_age']) && isset($row[$headerMap['user_age']]) && is_numeric(trim($row[$headerMap['user_age']])) ? (int)trim($row[$headerMap['user_age']]) : null;
                $gender = isset($headerMap['user_gender']) && isset($row[$headerMap['user_gender']]) ? trim($row[$headerMap['user_gender']]) : null;

                $crno = User::formatCrno($rawCrno);

                if (empty($name) || empty($crno) || isset($existingCrnos[$crno])) {
                    $skippedCount++;
                    continue;
                }

                $existingCrnos[$crno] = true;

                $batch[] = [
                    'name'        => $name,
                    'crno'        => $crno,
                    'user_age'    => $age,
                    'user_gender' => $gender,
                    'password'    => $defaultPasswordHash,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ];

                if (count($batch) >= 250) {
                    DB::table('users')->insert($batch);
                    $insertedCount += count($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                DB::table('users')->insert($batch);
                $insertedCount += count($batch);
            }

            DB::commit();
            Log::info("Bulk import completed successfully: {$insertedCount} imported, {$skippedCount} skipped from {$this->filePath}");
        } catch (\Exception $e) {
            DB::rollBack();
            $errorMessage = $e->getMessage();
            Log::error("Bulk import failed for file {$this->filePath}: " . $errorMessage);
        } finally {
            fclose($handle);
            if (file_exists($this->filePath)) {
                @unlink($this->filePath);
            }
        }

        return ['imported' => $insertedCount, 'skipped' => $skippedCount, 'error' => $errorMessage];
    }
}
