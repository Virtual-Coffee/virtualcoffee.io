ALTER TABLE "volunteer_invite_ledger" ADD CONSTRAINT "volunteer_invite_ledger_reason_keys" CHECK (("reason" <> 'monthly_accrual' OR "period_key" IS NOT NULL)
				AND ("reason" <> 'spend' OR "invite_id" IS NOT NULL)
				AND ("reason" NOT IN ('refund_cancelled', 'refund_expired') OR "invite_id" IS NOT NULL));