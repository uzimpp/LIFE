package app

import (
	"os"
	"os/signal"
	"syscall"

	"life/internal/config"
	router "life/internal/controller/http"
	v1 "life/internal/controller/http/v1"
	pgRepo "life/internal/repo/postgres"
	authUC "life/internal/usecase/auth"
	energyUC "life/internal/usecase/energy"
	odysseyUC "life/internal/usecase/odyssey"
	snapshotUC "life/internal/usecase/snapshot"
	"life/pkg/httpserver"
	"life/pkg/logger"
	pg "life/pkg/postgres"
)

func Run(cfg *config.Config) {
	l := logger.New(cfg.Log.Level)

	database, err := pg.New(cfg.PG.URL, pg.MaxPoolSize(cfg.PG.PoolMax))
	if err != nil {
		l.Fatal("app - Run - postgres.New: %w", err)
	}
	defer database.Close()

	// Repos
	db := &pgRepo.DB{Pool: database.Pool}
	userRepo := pgRepo.NewUserRepo(db)
	sessionRepo := pgRepo.NewSessionRepo(db)
	snapshotRepo := pgRepo.NewSnapshotRepo(db)
	odysseyRepo := pgRepo.NewOdysseyRepo(db)
	energyRepo := pgRepo.NewEnergyRepo(db)

	// Usecases
	authUseCase := authUC.New(cfg, userRepo, sessionRepo)
	snapshotUseCase := snapshotUC.New(snapshotRepo)
	odysseyUseCase := odysseyUC.New(odysseyRepo)
	energyUseCase := energyUC.New(energyRepo)

	deps := v1.Deps{
		AuthUC:       authUseCase,
		SnapshotUC:   snapshotUseCase,
		OdysseyUC:    odysseyUseCase,
		EnergyUC:     energyUseCase,
		Sessions:     sessionRepo,
		Users:        userRepo,
		CookieName:   cfg.Session.CookieName,
		CookieTTL:    cfg.Session.TTL,
		CookieSecure: cfg.Session.Secure,
		CookieDomain: cfg.Session.Domain,
		FrontendURL:  cfg.HTTP.Host,
	}

	r := router.New(cfg, deps)

	httpServer := httpserver.New(httpserver.Port(cfg.HTTP.Port))
	httpServer.Start(r)

	l.Info("app - Run - httpServer started on :%s", cfg.HTTP.Port)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		l.Info("app - Run - signal received: %s", sig)
	case err := <-httpServer.Notify():
		l.Error("app - Run - httpServer.Notify: %w", err)
	}

	l.Info("app - Run - shutting down server...")
	if err := httpServer.Shutdown(); err != nil {
		l.Error("app - Run - httpServer.Shutdown: %w", err)
	}
	l.Info("app - Run - server exited")
}
