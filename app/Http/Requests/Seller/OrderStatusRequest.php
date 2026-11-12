<?php

namespace App\Http\Requests\Seller;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('order');

        return $order instanceof Order && $this->user()->can('updateStatus', $order);
    }

    /**
     * Status tujuan hanya boleh salah satu transisi yang sah dari status saat ini.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Order $order */
        $order = $this->route('order');
        $allowed = array_map(fn (OrderStatus $s) => $s->value, $order->status->sellerTransitions());

        return [
            'status' => ['required', 'string', Rule::in($allowed)],
            'note' => [
                Rule::requiredIf($this->input('status') === OrderStatus::Cancelled->value),
                'nullable', 'string', 'max:255',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.in' => 'Perubahan status ini tidak sesuai alur pesanan.',
            'note.required' => 'Tuliskan alasan pembatalan agar pembeli mendapat penjelasan.',
        ];
    }
}
