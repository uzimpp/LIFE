package config

import (
	"fmt"
	"time"

	"github.com/caarlos0/env/v11"
)

type (
	Config struct {
		App     App
		HTTP    HTTP
		Log     Log
		PG      PG
		Swagger Swagger
		OAuth   OAuth
		Session Session
	}

	App struct {
		Name    string `env:"APP_NAME,required"`
		Version string `env:"APP_VERSION,required"`
	}

	HTTP struct {
		Host string `env:"HTTP_HOST" envDefault:"0.0.0.0"`
		Port string `env:"HTTP_PORT" envDefault:"8080"`
	}

	PG struct {
		URL     string `env:"PG_URL,required"`
		PoolMax int    `env:"PG_POOL_MAX" envDefault:"10"`
	}

	Log struct {
		Level string `env:"LOG_LEVEL" envDefault:"info"`
	}

	Swagger struct {
		Enabled bool `env:"SWAGGER_ENABLED" envDefault:"false"`
	}

	OAuth struct {
		ClientID     string `env:"OAUTH_CLIENT_ID,required"`
		ClientSecret string `env:"OAUTH_CLIENT_SECRET,required"`
		RedirectURL  string `env:"OAUTH_REDIRECT_URL,required"`
	}

	Session struct {
		CookieName string        `env:"SESSION_COOKIE_NAME" envDefault:"session"`
		TTL        time.Duration `env:"SESSION_TTL" envDefault:"720h"` // 30 days
		Domain     string        `env:"SESSION_DOMAIN" envDefault:""`
		Secure     bool          `env:"SESSION_SECURE" envDefault:"false"`
	}
)

func NewConfig() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, fmt.Errorf("config error: %w", err)
	}

	return cfg, nil
}
