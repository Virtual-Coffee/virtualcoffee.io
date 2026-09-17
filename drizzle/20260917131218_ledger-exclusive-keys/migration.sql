ALTER TABLE "volunteer_invite_ledger" DROP CONSTRAINT "volunteer_invite_ledger_reason_keys", ADD CONSTRAINT "volunteer_invite_ledger_reason_keys" CHECK ((
				("reason" = 'monthly_accrual' AND "period_key" IS NOT NULL)
				OR ("reason" <> 'monthly_accrual' AND "period_key" IS NULL)
			) AND (
				("reason" IN ('spend', 'refund_cancelled', 'refund_expired') AND "invite_id" IS NOT NULL)
				OR ("reason" NOT IN ('spend', 'refund_cancelled', 'refund_expired') AND "invite_id" IS NULL)
			));