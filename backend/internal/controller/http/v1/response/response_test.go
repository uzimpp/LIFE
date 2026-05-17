package response_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"life/internal/controller/http/v1/response"
)

func TestSuccess(t *testing.T) {
	rr := httptest.NewRecorder()
	response.Success(rr, map[string]string{"key": "value"})

	if rr.Code != http.StatusOK {
		t.Errorf("got status %d, want %d", rr.Code, http.StatusOK)
	}

	var got response.Response
	if err := json.NewDecoder(rr.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if !got.Success {
		t.Error("expected success=true")
	}
	if got.Error != nil {
		t.Errorf("expected no error, got %v", got.Error)
	}
}

func TestErrorResponse(t *testing.T) {
	tests := []struct {
		name    string
		fn      func(w http.ResponseWriter, msg string)
		wantCode int
		wantKey  string
	}{
		{"bad request", response.BadRequest, http.StatusBadRequest, "BAD_REQUEST"},
		{"unauthorized", response.Unauthorized, http.StatusUnauthorized, "UNAUTHORIZED"},
		{"not found", response.NotFound, http.StatusNotFound, "NOT_FOUND"},
		{"internal error", response.InternalError, http.StatusInternalServerError, "INTERNAL_ERROR"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			rr := httptest.NewRecorder()
			tc.fn(rr, "test message")

			if rr.Code != tc.wantCode {
				t.Errorf("got %d, want %d", rr.Code, tc.wantCode)
			}

			var got response.Response
			if err := json.NewDecoder(rr.Body).Decode(&got); err != nil {
				t.Fatalf("decode: %v", err)
			}
			if got.Success {
				t.Error("expected success=false")
			}
			if got.Error == nil {
				t.Fatal("expected error object")
			}
			if got.Error.Code != tc.wantKey {
				t.Errorf("got code %q, want %q", got.Error.Code, tc.wantKey)
			}
		})
	}
}
