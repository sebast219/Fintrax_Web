-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "GoalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "GoalSourceType" AS ENUM ('FROM_BALANCE', 'FROM_SAVINGS', 'INCREMENTAL');

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "priority" "GoalPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "sourceType" "GoalSourceType" NOT NULL DEFAULT 'FROM_BALANCE';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "failed_at" TIMESTAMP(3),
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "goals_user_id_priority_idx" ON "goals"("user_id", "priority");

-- CreateIndex
CREATE INDEX "goals_user_id_target_date_idx" ON "goals"("user_id", "target_date" ASC);

-- CreateIndex
CREATE INDEX "transactions_user_id_status_transaction_date_idx" ON "transactions"("user_id", "status", "transaction_date" DESC);
