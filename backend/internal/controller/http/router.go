package router

import (
	"net/http"

	"life/internal/config"
	"life/internal/controller/http/middleware"
	v1 "life/internal/controller/http/v1"

	httpSwagger "github.com/swaggo/http-swagger/v2"
)

func New(cfg *config.Config, deps v1.Deps) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	if cfg.Swagger.Enabled {
		mux.Handle("/swagger/", httpSwagger.Handler(
			httpSwagger.URL("/swagger/doc.json"),
		))
	}

	v1.RegisterV1(mux, deps)

	var h http.Handler = mux
	h = middleware.Logging(h)
	h = middleware.CORS(cfg, h)

	return h
}
