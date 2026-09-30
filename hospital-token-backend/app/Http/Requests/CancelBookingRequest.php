<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CancelBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'booking_id' => 'required_without:id|exists:bookings,id',
            'id' => 'required_without:booking_id|exists:bookings,id',
        ];
    }
    
    protected function prepareForValidation()
    {
        if ($this->has('id') && !$this->has('booking_id')) {
            $this->merge(['booking_id' => $this->id]);
        }
    }
}
