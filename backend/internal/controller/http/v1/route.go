package v1

import (
	"net/http"
	"time"

	"life/internal/controller/http/middleware"
	"life/internal/controller/http/v1/handler"
	"life/internal/usecase/auth"
	energyUC "life/internal/usecase/energy"
	odysseyUC "life/internal/usecase/odyssey"
	"life/internal/usecase/repo"
	"life/internal/usecase/snapshot"
)

type Deps struct {
	AuthUC       *auth.UseCase
	SnapshotUC   *snapshot.UseCase
	OdysseyUC    *odysseyUC.UseCase
	EnergyUC     *energyUC.UseCase
	Sessions     repo.SessionRepo
	Users        repo.UserRepo
	CookieName   string
	CookieTTL    time.Duration
	CookieSecure bool
	CookieDomain string
	FrontendURL  string
}

// RegisterV1 mounts all /v1 routes onto mux.
//
//	@title			LIFE API
//	@version		1.0
//	@description	API for the LIFE application
//	@BasePath		/v1
func RegisterV1(mux *http.ServeMux, deps Deps) {
	authH := handler.NewAuth(deps.AuthUC, deps.CookieName, deps.CookieTTL, deps.CookieSecure, deps.CookieDomain, deps.FrontendURL)
	snapshotH := handler.NewSnapshot(deps.SnapshotUC)
	odysseyH := handler.NewOdyssey(deps.OdysseyUC)
	energyH := handler.NewEnergy(deps.EnergyUC)
	dashboardH := handler.NewDashboard(deps.SnapshotUC, deps.OdysseyUC, deps.EnergyUC)

	authMW := middleware.Auth(deps.Sessions, deps.Users, deps.CookieName)

	// Auth
	mux.HandleFunc("GET /v1/auth/google", authH.BeginGoogle)
	mux.HandleFunc("GET /v1/auth/google/callback", authH.Callback)
	mux.HandleFunc("POST /v1/auth/logout", authH.Logout)
	mux.Handle("GET /v1/auth/me", authMW(http.HandlerFunc(authH.Me)))

	// Snapshots
	mux.Handle("POST /v1/snapshots", authMW(http.HandlerFunc(snapshotH.Create)))
	mux.Handle("GET /v1/snapshots", authMW(http.HandlerFunc(snapshotH.List)))
	mux.Handle("GET /v1/snapshots/latest", authMW(http.HandlerFunc(snapshotH.GetLatest)))

	// Odyssey
	mux.Handle("POST /v1/odyssey", authMW(http.HandlerFunc(odysseyH.Create)))
	mux.Handle("GET /v1/odyssey", authMW(http.HandlerFunc(odysseyH.List)))
	mux.Handle("GET /v1/odyssey/latest", authMW(http.HandlerFunc(odysseyH.GetLatest)))
	mux.Handle("PATCH /v1/odyssey/paths/{id}", authMW(http.HandlerFunc(odysseyH.UpdatePath)))

	// Energy
	mux.Handle("POST /v1/energy", authMW(http.HandlerFunc(energyH.Log)))
	mux.Handle("GET /v1/energy", authMW(http.HandlerFunc(energyH.List)))
	mux.Handle("GET /v1/energy/summary", authMW(http.HandlerFunc(energyH.Summary)))

	// Dashboard
	mux.Handle("GET /v1/dashboard", authMW(http.HandlerFunc(dashboardH.Get)))
}
