# how-to

## start the server

1. add a `.env` file, put following variables in the file as following:
   - `DATABASE_URL="mysql://username:password@host:port/dbName"`
   - `MAX_MOCK_COUNT` = 100 *(any int)*
2. run `npm run db:migrate` to create tables in the database
3. run `npm run run:dev` to run the dev server
   1. alter the `MAX_MOCK_COUNT` in `src/mock/mockTrade.ts` to change the max number of mocked items that the mocker may generate each time
