module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    plugins: [
        "react",
        "@typescript-eslint",
        "@m6web/i18n",
    ],
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "prettier"
    ],
    overrides: [
        {
            "files": ["src/**/*.{js,jsx,ts,tsx}"],
            "excludedFiles": ["build/**", "node_modules/**"],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        jsx: true,
        useJSXTextNode: true,
        projectService: true,
        tsconfigRootDir: __dirname,
        project: true
    },
    rules: {
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "react/react-in-jsx-scope": "off",

        "@m6web/i18n/no-unknown-key": "error",
        "@m6web/i18n/no-unknown-key-secondary-langs": "warn",
        "@m6web/i18n/no-text-as-children": ["error", {"ignorePattern": "^\\s?[/.]\\s?$"}],
        "@m6web/i18n/no-text-as-attribute": ["error", {"attributes": ["alt", "title"]}],
        "@m6web/i18n/interpolation-data": ["error", { "interpolationPattern": "\\{\\.+\\}" }]
    },
    settings: {
        "react": {
            "version": "detect"
        },
        "i18n": {
            // Your principal languages used in 'no-unknown-key' rule
            "principalLangs": [
                {
                    "name": "enUS",
                    "translationPath": "/locales/enUS.json"
                }
            ],
            // Secondary languages used in 'no-unknown-key-secondary-langs' rule
            "secondaryLangs": [
                {
                    "name": "fr",
                    "translationPath": "/locales/fr.json"
                }
            ],
            // Name of your translate function
            "functionName": "t",
            // If you want to ignore specific files
            "ignoreFiles": ["**/*.spec.js", "**/*.int.js"],
            // If you have pluralization
            "pluralizedKeys": ["one", "other"],
            // TTL of the translations file caching (defaults to 500ms)
            "translationsCacheTTL": 300
        }
    },
    root: true,
}
