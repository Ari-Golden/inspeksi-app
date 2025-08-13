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
        Schema::table('inspections', function (Blueprint $table) {
            $table->dropColumn(['component_name', 'component_function', 'component_condition', 'check_results']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->string('component_name')->nullable();
            $table->string('component_function')->nullable();
            $table->text('component_condition')->nullable();
            $table->text('check_results')->nullable();
        });
    }
};
