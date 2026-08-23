<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->unsignedSmallInteger('settlement_year')->nullable()->after('date');
            $table->unsignedTinyInteger('settlement_month')->nullable()->after('settlement_year');
        });

        // Backfill existing rows: for anything created before this column
        // existed, the settlement month is simply the date's own month.
        DB::table('expenses')->orderBy('id')->select('id', 'date')->each(function ($expense) {
            $date = Carbon::parse($expense->date);
            DB::table('expenses')->where('id', $expense->id)->update([
                'settlement_year' => $date->year,
                'settlement_month' => $date->month,
            ]);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->unsignedSmallInteger('settlement_year')->nullable(false)->change();
            $table->unsignedTinyInteger('settlement_month')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['settlement_year', 'settlement_month']);
        });
    }
};
