package utils

import (
	"bytes"
	"encoding/json"
	"net/http"
)

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
