<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_materials', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('topic', 40)->default('onboarding')->index();
            $table->string('summary', 240)->nullable();
            $table->longText('content');
            $table->unsignedSmallInteger('duration_minutes')->default(5);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('training_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_material_id')->constrained()->cascadeOnDelete();
            $table->timestamp('completed_at');
            $table->timestamps();

            $table->unique(['user_id', 'training_material_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_progress');
        Schema::dropIfExists('training_materials');
    }
};
