package utils

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type errorResponse struct {
	Error errorBody `json:"error"`
}

type errorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func WriteJSON(w http.ResponseWriter, status int, data any) {
	var body bytes.Buffer
	if err := json.NewEncoder(&body).Encode(data); err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("{\"error\":{\"code\":\"response_encoding_error\",\"message\":\"failed to encode response\",\"request_id\":\"\"}}\n"))
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(body.Bytes())
}

func NewErrorResponse(code string, message string) errorResponse {
	return errorResponse{
		Error: errorBody{
			Code:    code,
			Message: message,
		},
	}
}
