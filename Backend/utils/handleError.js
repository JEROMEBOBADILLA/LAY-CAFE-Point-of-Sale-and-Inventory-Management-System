import ValidationError from './ValidationError.js';
export default function handleError(res, err) {
  if (err instanceof ValidationError)
    return res.status(err.statusCode).json({ message: err.message });
  if (err?.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ message: 'This item already exists. Choose a unique name.' });
  if (err?.code === 'ER_ROW_IS_REFERENCED_2')
    return res.status(409).json({ message: 'Cannot delete this item because it is used in a product recipe or movement history.' });
  if (err?.code === 'ER_NO_REFERENCED_ROW_2')
    return res.status(409).json({ message: 'The selected inventory ingredient no longer exists.' });
  if (err?.code === 'ECONNREFUSED')
    return res.status(503).json({ message: 'MySQL is unavailable. Start MySQL in XAMPP and check DB_PORT in Backend/.env.' });
  if (err?.code === 'ER_BAD_DB_ERROR')
    return res.status(503).json({ message: 'Database not found. Import Backend/sql/schema.sql in phpMyAdmin and set DB_NAME=laycafedb in Backend/.env.' });
  if (err?.code === 'ER_NO_SUCH_TABLE')
    return res.status(503).json({ message: 'A required database table is missing. Import Backend/sql/schema.sql, use DB_NAME=laycafedb, and run npm run seed.' });
  if (err?.code === 'ER_ACCESS_DENIED_ERROR')
    return res.status(503).json({ message: 'MySQL login failed. Check DB_USER and DB_PASSWORD in Backend/.env.' });
  console.error(err);
  return res.status(err?.status === 404 ? 404 : 500).json({ message: err?.status === 404 ? 'Endpoint not found.' : 'Server error. Check the backend console.' });
}
