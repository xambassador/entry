package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

const (
	defaultPort          = 3000
	defaultData          = "./data"
	entryPortEnv         = "ENTRY_PORT"
	entryDataDirEnv      = "ENTRY_DATA_DIR"
	entryDBPathEnv       = "ENTRY_DB_PATH"
	entryDevProxyEnv     = "ENTRY_DEV_PROXY"
	readTimeoutEnv       = "ENTRY_READ_TIMEOUT"
	readHeaderTimeoutEnv = "ENTRY_READ_HEADER_TIMEOUT"
	writeTimeoutEnv      = "ENTRY_WRITE_TIMEOUT"
	idleTimeoutEnv       = "ENTRY_IDLE_TIMEOUT"
	requestTimeoutEnv    = "ENTRY_REQUEST_TIMEOUT"
	listDefaultLimitEnv  = "ENTRY_LIST_DEFAULT_LIMIT"
	listMaxLimitEnv      = "ENTRY_LIST_MAX_LIMIT"
	authSecretEnv        = "ENTRY_AUTH_SECRET"
	sessionDurationEnv   = "ENTRY_SESSION_DURATION"
)

type Config struct {
	Port     int
	DataDir  string
	DBPath   string
	DevProxy string // Vite dev server URL, e.g. "http://localhost:5173". Empty in production.
	RequestConfig
	PaginationConfig
	AuthConfig
}

type AuthConfig struct {
	AuthSecret      string
	SessionDuration time.Duration
}

type RequestConfig struct {
	ReadTimeout       time.Duration
	ReadHeaderTimeout time.Duration
	WriteTimeout      time.Duration
	IdleTimeout       time.Duration
	RequestTimeout    time.Duration
}

type PaginationConfig struct {
	MaxLimit     int
	DefaultLimit int
}

func Load() (Config, error) {
	port := defaultPort
	if raw := os.Getenv(entryPortEnv); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 1 || parsed > 65535 {
			return Config{}, fmt.Errorf("invalid ENTRY_PORT: %q", raw)
		}
		port = parsed
	}

	dataDir := defaultData
	if raw := os.Getenv(entryDataDirEnv); raw != "" {
		dataDir = raw
	}

	dbPath := os.Getenv(entryDBPathEnv)
	if dbPath == "" {
		dbPath = filepath.Join(dataDir, "entry.db")
	}

	devProxy := os.Getenv(entryDevProxyEnv)

	readTimeout, err := readDurationEnv(readTimeoutEnv, 10*time.Second)
	if err != nil {
		return Config{}, err
	}

	readHeaderTimeout, err := readDurationEnv(readHeaderTimeoutEnv, 5*time.Second)
	if err != nil {
		return Config{}, err
	}

	writeTimeout, err := readDurationEnv(writeTimeoutEnv, 15*time.Second)
	if err != nil {
		return Config{}, err
	}

	idleTimeout, err := readDurationEnv(idleTimeoutEnv, 60*time.Second)
	if err != nil {
		return Config{}, err
	}

	requestTimeout, err := readDurationEnv(requestTimeoutEnv, 15*time.Second)
	if err != nil {
		return Config{}, err
	}

	listDefaultLimit, err := readIntEnv(listDefaultLimitEnv, 30, 1, 1000)
	if err != nil {
		return Config{}, err
	}

	listMaxLimit, err := readIntEnv(listMaxLimitEnv, 100, 1, 5000)
	if err != nil {
		return Config{}, err
	}

	if listDefaultLimit > listMaxLimit {
		fmt.Printf("warning: %s (%d) is greater than %s (%d), adjusting default to max\n", listDefaultLimitEnv, listDefaultLimit, listMaxLimitEnv, listMaxLimit)
		listDefaultLimit = listMaxLimit
	}

	authSecret := os.Getenv(authSecretEnv)
	if authSecret == "" {
		return Config{}, fmt.Errorf("%s is required", authSecretEnv)
	}

	sessionDuration, err := readDurationEnv(sessionDurationEnv, 7*24*time.Hour)
	if err != nil {
		return Config{}, err
	}

	requestConfig := RequestConfig{
		ReadTimeout:       readTimeout,
		ReadHeaderTimeout: readHeaderTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
		RequestTimeout:    requestTimeout,
	}

	paginationConfig := PaginationConfig{
		MaxLimit:     listMaxLimit,
		DefaultLimit: listDefaultLimit,
	}

	cfg := Config{
		Port:             port,
		DataDir:          dataDir,
		DBPath:           dbPath,
		DevProxy:         devProxy,
		RequestConfig:    requestConfig,
		PaginationConfig: paginationConfig,
		AuthConfig: AuthConfig{
			AuthSecret:      authSecret,
			SessionDuration: sessionDuration,
		},
	}

	return cfg, nil
}

func readDurationEnv(name string, fallback time.Duration) (time.Duration, error) {
	raw := os.Getenv(name)
	if raw == "" {
		return fallback, nil
	}
	parsed, err := time.ParseDuration(raw)
	if err != nil {
		return 0, fmt.Errorf("invalid %s: %q", name, raw)
	}
	if parsed <= 0 {
		return 0, fmt.Errorf("%s must be greater than zero", name)
	}
	return parsed, nil
}

func readIntEnv(name string, fallback, min, max int) (int, error) {
	raw := os.Getenv(name)
	if raw == "" {
		return fallback, nil
	}
	parsed, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("invalid %s: %q", name, raw)
	}
	if parsed < min || parsed > max {
		return 0, fmt.Errorf("%s must be in range [%d,%d]", name, min, max)
	}
	return parsed, nil
}
