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
     * Execute the job.
     */
    public function handle(): void
    {
        if (!file_exists($this->filePath)) {
            Log::error("Import file not found: {$this->filePath}");
            return;
        }

        $handle = fopen($this->filePath, 'r');
        if ($handle === false) {
            Log::error("Failed to open import file: {$this->filePath}");
            return;
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return;
        }
        $header = array_map(fn($col) => strtolower(trim($col)), $header);

        $batch = [];
        $now = now()->toDateTimeString();
        $existingCrnos = User::pluck('crno')->flip()->all();
        $rowNumber = 1;

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;

                if (count(array_filter($row, fn($v) => trim($v) !== '')) === 0) {
                    continue;
                }

                if (count($row) !== count($header)) {
                    continue;
                }

                $data = array_combine($header, $row);
                $name = trim($data['name'] ?? '');
                $crno = trim($data['crno'] ?? '');

                $crno = User::formatCrno($crno);

                if (empty($name) || empty($crno) || isset($existingCrnos[$crno])) {
                    continue;
                }

                $existingCrnos[$crno] = true;

                $batch[] = [
                    'name'        => $name,
                    'crno'        => $crno,
                    'user_age'    => isset($data['user_age']) && is_numeric($data['user_age']) ? (int)$data['user_age'] : null,
                    'user_gender' => trim($data['user_gender'] ?? '') ?: null,
                    'password'    => Hash::make($crno),
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ];

                if (count($batch) >= 50) {
                    DB::table('users')->insert($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                DB::table('users')->insert($batch);
            }

            DB::commit();
            Log::info("Bulk import completed successfully for file: {$this->filePath}");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Bulk import failed for file {$this->filePath}: " . $e->getMessage());
        } finally {
            fclose($handle);
            if (file_exists($this->filePath)) {
                unlink($this->filePath);
            }
        }
    }
}
