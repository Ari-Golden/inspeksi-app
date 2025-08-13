<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('asset_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('location');
            $table->string('condition');
            $table->string('estimate_cost')->nullable();
            $table->text('finding');
            $table->text('analysis')->nullable();
            $table->text('recommendation')->nullable();
            $table->string('component_name');
            $table->string('component_function');
            $table->text('component_condition');
            $table->text('check_results');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};
