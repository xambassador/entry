package api

type ErrorCode = string

const (
	ErrInvalidRequestBody   ErrorCode = "invalid_request_body"
	ErrInternalError        ErrorCode = "internal_error"
	ErrEntryAlreadyExists   ErrorCode = "entry_exists"
	ErrEntryNotFound        ErrorCode = "entry_not_found"
	ErrInvalidMonth         ErrorCode = "invalid_month"
	ErrInvalidYear          ErrorCode = "invalid_year"
	ErrInvalidLimitOrOffset ErrorCode = "invalid_limit_or_offset"
	ErrMissingQuery         ErrorCode = "missing_query"
	ErrUnauthorized         ErrorCode = "unauthorized"
	ErrInvalidPassphrase    ErrorCode = "invalid_passphrase"
)
