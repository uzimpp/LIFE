package response

import (
	"encoding/json"
	"net/http"
)

type Error struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *Error      `json:"error,omitempty"`
}

func Success(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{Success: true, Data: data})
}

func ErrorResponse(w http.ResponseWriter, statusCode int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Error:   &Error{Code: code, Message: message},
	})
}

func BadRequest(w http.ResponseWriter, message string) {
	ErrorResponse(w, http.StatusBadRequest, "BAD_REQUEST", message)
}

func Unauthorized(w http.ResponseWriter, message string) {
	ErrorResponse(w, http.StatusUnauthorized, "UNAUTHORIZED", message)
}

func NotFound(w http.ResponseWriter, message string) {
	ErrorResponse(w, http.StatusNotFound, "NOT_FOUND", message)
}

func InternalError(w http.ResponseWriter, message string) {
	ErrorResponse(w, http.StatusInternalServerError, "INTERNAL_ERROR", message)
}
