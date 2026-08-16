# Manager portal test data

The manager portal reads live Firebase data. For demonstrations, use only the
`cofkans-staging` Firebase project. The test records are marked with
`isTestData: true` and use the `__test_manager__` document prefix.

## Seed or remove the walkthrough data

Set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON file for the
staging project, then run:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/staging-service-account.json \
  node scripts/manager-test-data.mjs seed

GOOGLE_APPLICATION_CREDENTIALS=/path/to/staging-service-account.json \
  node scripts/manager-test-data.mjs delete
```

The script refuses to run if the authenticated project is not
`cofkans-staging`. The delete command removes only records that have both the
test-data marker and the expected document prefix.

The walkthrough covers branches, products, orders, staff accounts, inventory,
approvals, reports, and spreadsheet rows. Never run this script with a
production credential or use real customer information in the test records.
