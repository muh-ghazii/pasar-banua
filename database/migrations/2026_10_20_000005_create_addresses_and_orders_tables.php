<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label', 40)->default('Rumah');
            $table->string('recipient_name');
            $table->string('phone', 30);
            $table->text('address_line');
            $table->string('city', 100)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number', 30)->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('umkm_profile_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('pending')->index();
            $table->string('recipient_name');
            $table->string('phone', 30);
            $table->text('address_line');
            $table->string('city', 100)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->text('notes')->nullable();
            $table->string('payment_method', 30)->default('transfer_demo');
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('shipping_fee')->default(0);
            $table->unsignedInteger('total');
            $table->string('tracking_note')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('is_demo')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['umkm_profile_id', 'status']);
            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            // Snapshot supaya riwayat pesanan tidak berubah saat produk diedit.
            $table->string('product_name');
            $table->string('product_image')->nullable();
            $table->unsignedInteger('unit_price');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('subtotal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('addresses');
    }
};
