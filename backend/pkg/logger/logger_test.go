package logger_test

import (
	"testing"

	"github.com/rs/zerolog"

	"life/pkg/logger"
)

func TestNewSetsGlobalLevel(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  zerolog.Level
	}{
		{"error", "error", zerolog.ErrorLevel},
		{"warn", "warn", zerolog.WarnLevel},
		{"info", "info", zerolog.InfoLevel},
		{"debug", "debug", zerolog.DebugLevel},
		{"mixed case", "DeBuG", zerolog.DebugLevel},
		{"unknown defaults to info", "verbose", zerolog.InfoLevel},
		{"empty defaults to info", "", zerolog.InfoLevel},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			l := logger.New(tc.input)
			if l == nil {
				t.Fatal("expected non-nil logger")
			}
			if got := zerolog.GlobalLevel(); got != tc.want {
				t.Errorf("global level = %v, want %v", got, tc.want)
			}
		})
	}
}

func TestLoggerImplementsInterface(t *testing.T) {
	var _ logger.Interface = logger.New("info")
}
