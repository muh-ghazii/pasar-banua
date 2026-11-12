<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('umkm_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline', 160)->nullable();
            $table->text('description')->nullable();
            $table->text('story')->nullable();
            $table->string('city', 100)->index();
            $table->string('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('instagram', 100)->nullable();
            $table->string('logo_path')->nullable();
            $table->string('cover_path')->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('umkm_profiles');
    }
};
