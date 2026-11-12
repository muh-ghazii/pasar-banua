<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('summary', 200)->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('price');
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('weight_gram')->nullable();
            $table->string('status', 20)->default('pending');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->text('rejection_reason')->nullable();
            $table->unsignedInteger('sold_count')->default(0);
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_active', 'deleted_at']);
            $table->index('price');
            $table->index('is_featured');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('alt')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_stories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->text('process_note')->nullable();
            $table->text('material_note')->nullable();
            $table->text('cultural_note')->nullable();
            // false = konten contoh / belum diverifikasi admin.
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
        });

        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->boolean('is_demo')->default(false);
            $table->timestamps();

            $table->unique(['product_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('product_stories');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
    }
};
