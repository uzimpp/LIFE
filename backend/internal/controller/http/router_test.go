package router_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"life/internal/config"
	router "life/internal/controller/http"
	v1 "life/internal/controller/http/v1"
)

func TestHealthz(t *testing.T) {
	cfg := &config.Config{}
	h := router.New(cfg, v1.Deps{CookieName: "session"})

	tests := []struct {
		name   string
		method string
		path   string
		want   int
	}{
		{"healthz OK", http.MethodGet, "/healthz", http.StatusOK},
		{"wrong method", http.MethodPost, "/healthz", http.StatusMethodNotAllowed},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, nil)
			rr := httptest.NewRecorder()
			h.ServeHTTP(rr, req)
			if rr.Code != tc.want {
				t.Errorf("got %d, want %d", rr.Code, tc.want)
			}
		})
	}
}
