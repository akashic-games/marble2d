module.exports = {
	"roots": [
		"<rootDir>/src"
	],
	"testMatch": [
		"**/__tests__/**/*.+(ts|tsx|js)",
		"**/?(*.)+(spec|test).+(ts|tsx|js)"
	],
	"testPathIgnorePatterns": [
		"<rootDir>/src/__tests__/reference"
	],
	"transform": {
		"^.+\\.(ts|tsx)$": ["ts-jest", { "tsconfig": "tsconfig.jest.json" }]
	}
};
