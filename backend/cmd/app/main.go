package main

import (
	"log"

	_ "life/docs"
	"life/internal/app"
	"life/internal/config"
)

func main() {
	cfg, err := config.NewConfig()
	if err != nil {
		log.Fatalf("Config error: %s", err)
	}

	app.Run(cfg)
}
