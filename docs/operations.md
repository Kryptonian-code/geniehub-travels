# GenieHub Operations Notes

## Backup Routine

1. Export the MySQL database before any schema update.
2. Copy the `api/uploads` folder to a dated backup directory.
3. Keep at least one daily and one weekly backup set.

## Recovery Routine

1. Restore the latest working MySQL export.
2. Restore the matching `api/uploads` snapshot.
3. Re-apply any safe content changes made after the backup only after validation.

## Deployment Checklist

1. Confirm `.env` values are correct for the target machine.
2. Confirm Apache can write to `api/uploads`.
3. Run the latest schema update or import `xampp/schema.sql`.
4. Verify a client login, an admin login, a document upload, and a payment record after deployment.
