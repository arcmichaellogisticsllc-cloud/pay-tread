<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loads', function (Blueprint $table) {
            $table->string('pod_signature_path')->nullable();
            $table->timestamp('pod_signed_at')->nullable();

            $table->string('pod_signer_name')->nullable();
            $table->string('pod_signer_role')->nullable();

            $table->decimal('pod_lat', 10, 7)->nullable();
            $table->decimal('pod_lng', 10, 7)->nullable();
            $table->unsignedInteger('pod_accuracy_m')->nullable();

            $table->string('pod_receiver_email')->nullable();
            $table->string('pod_receiver_phone_e164')->nullable();

            // simple review state
            $table->string('pod_review_status')->default('pending'); // pending|verified|rejected
            $table->text('pod_review_reason')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('loads', function (Blueprint $table) {
            $table->dropColumn([
                'pod_signature_path',
                'pod_signed_at',
                'pod_signer_name',
                'pod_signer_role',
                'pod_lat',
                'pod_lng',
                'pod_accuracy_m',
                'pod_receiver_email',
                'pod_receiver_phone_e164',
                'pod_review_status',
                'pod_review_reason',
            ]);
        });
    }
};
