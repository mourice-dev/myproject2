# myproject2: Docker and GitHub Learning Project

This project demonstrates how to:

- Create a small Node.js application.
- Build a Docker image from a `Dockerfile`.
- Run the application in a Docker container.
- Store source code in Git and push it to GitHub.
- Tag and publish a Docker image to GitHub Container Registry (GHCR).
- Use Docker Compose to describe how the application should run.
- Pull the same image back and run it on another machine.

## Project files

```text
myproject2/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── compose.yml
├── package.json
├── package-lock.json
├── app.js
└── README.md
```

`node_modules/` is created locally by npm and is intentionally not stored in Git.

## The application

The application is defined in [`app.js`](./app.js):

```js
/** @format */

console.log("Hi nshuti maurice!");

const express = require("express");
const cors = require("cors");
const server = express(cors());
server.use((req, res) => {
    res.send("Hello world");
})

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

It does two things:

1. Prints `Hi nshuti maurice!` when Node starts.
2. Starts an Express HTTP server on port `3000`.

Every request receives:

```text
Hello world
```

The application listens on port `3000` inside the container.

## `package.json`

The project uses CommonJS Node.js modules and has Express, CORS, and Nodemon dependencies:

```json
{
  "name": "myproject2",
  "version": "1.0.0",
  "description": "",
  "license": "ISC",
  "author": "",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "cors": "^2.8.6",
    "express": "^5.3.0",
    "nodemon": "^3.1.14"
  }
}
```

Install dependencies locally with:

```powershell
npm install
```

This creates `node_modules/`. It should not be committed because it can always be recreated from `package.json` and `package-lock.json`.

## Dockerfile

The current [`Dockerfile`](./Dockerfile) is:

```dockerfile
FROM node:22

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
CMD [ "node","app.js" ]
```

### What each instruction does

| Instruction | Purpose |
|---|---|
| `FROM node:22` | Uses the official Node.js 22 image as the base. |
| `WORKDIR /app` | Makes `/app` the working directory inside the image. |
| `COPY package*.json ./` | Copies dependency manifests first. |
| `RUN npm install` | Installs the dependencies inside the image. |
| `COPY . .` | Copies the remaining project files into `/app`. |
| `CMD ...` | Starts the application when a container runs. |

Copying the package files before the rest of the source allows Docker to reuse the dependency layer when only application code changes.

## `.dockerignore`

The current [`.dockerignore`](./.dockerignore) is:

```text
node_modules
.git
.env
*.log
```

This prevents local dependencies, Git metadata, environment secrets, and log files from being sent to Docker as build context.

## `.gitignore`

The current [`.gitignore`](./.gitignore) is:

```text
.env
node_modules/
```

This prevents `.env` and `node_modules/` from being committed to GitHub.

Never commit passwords, access tokens, API keys, or other secrets.

## Build the Docker image

Open PowerShell in the project directory:

```powershell
cd "C:\Users\nshut\OneDrive\Attachments\Documents\learning-docker\myproject2"
```

Build the image:

```powershell
docker build -t myproject:latest .
```

Explanation:

- `docker build` builds an image.
- `-t myproject:latest` assigns the image name and tag.
- `.` uses the current directory as the build context.

List local images:

```powershell
docker images
```

## Run the container

Run the application:

```powershell
docker run --name myproject-container myproject:latest
```

The container starts the Node application. To access the HTTP server from Windows, publish the port:

```powershell
docker run --name myproject-web -p 3000:3000 myproject:latest
```

Then open:

```text
http://localhost:3000
```

The first `3000` is the Windows host port. The second `3000` is the container port.

Useful container commands:

```powershell
# Show running containers
docker ps

# Show running and stopped containers
docker ps -a

# Stop a running container
docker stop myproject-web

# Remove a stopped container
docker rm myproject-web

# Show the container's output
docker logs myproject-web
```

The `hello-world` image is only a Docker installation test:

```powershell
docker pull hello-world
docker run hello-world
```

## Docker Compose

The current [`compose.yml`](./compose.yml) is:

```yaml
services:
  app:
    build: .
    image: ghcr.io/mourice-dev/myproject2:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
```

This tells Compose to:

- Build the image from the current directory.
- Name it `ghcr.io/mourice-dev/myproject2:latest`.
- Map host port `3000` to container port `3000`.
- Load environment variables from `.env`.

Because `.env` is ignored, create it locally if the Compose version requires the file:

```powershell
New-Item .env -ItemType File
```

Do not add secrets to this documentation or commit the `.env` file.

Start the application with Compose:

```powershell
docker compose up --build
```

Run it in the background:

```powershell
docker compose up --build -d
```

View logs:

```powershell
docker compose logs -f app
```

Stop the Compose application:

```powershell
docker compose down
```

## Store the source code on GitHub

Git stores the source code and project configuration. It does not store Docker's internal image layers.

Initialize Git once:

```powershell
git init
git branch -M main
```

Add the GitHub repository as the `origin` remote. The order is important:

```powershell
git remote add origin https://github.com/mourice-dev/myproject2.git
```

The syntax is:

```text
git remote add <remote-name> <repository-url>
```

Check the remote:

```powershell
git remote -v
```

Commit and push:

```powershell
git add .
git commit -m "Initial project"
git push -u origin main
```

For later changes:

```powershell
git add .
git commit -m "Describe the change"
git push
```

If `origin` already exists, do not add it again. Update it instead:

```powershell
git remote set-url origin https://github.com/mourice-dev/myproject2.git
```

The `LF will be replaced by CRLF` messages seen on Windows are line-ending warnings, not push failures.

## Publish the image to GitHub Container Registry

GitHub Container Registry stores Docker images. This is separate from the GitHub source repository.

The image name used in this project is:

```text
ghcr.io/mourice-dev/myproject2:latest
```

An image reference is not a PowerShell command by itself. This is incorrect:

```powershell
ghcr.io/mourice-dev/myproject2:latest
```

Use it with a Docker command.

### Tag the image

```powershell
docker tag myproject:latest ghcr.io/mourice-dev/myproject2:latest
```

### Authenticate

Create a GitHub Personal Access Token with package permissions. For a classic token, it needs at least:

- `write:packages` to push images.
- `read:packages` to pull private images.

Log in:

```powershell
docker login ghcr.io
```

Use `mourice-dev` as the username and the token as the password. Do not use the normal GitHub password.

If Docker has cached a bad credential:

```powershell
docker logout ghcr.io
docker login ghcr.io
```

### Push the image

```powershell
docker push ghcr.io/mourice-dev/myproject2:latest
```

A successful push ends with a digest similar to:

```text
latest: digest: sha256:...
```

The image can then be viewed under your GitHub account's Packages area.

## Pull and run the image later

On another computer, install Docker Desktop, start the Docker Engine, and log in:

```powershell
docker login ghcr.io
docker pull ghcr.io/mourice-dev/myproject2:latest
docker run --name myproject-restored -p 3000:3000 ghcr.io/mourice-dev/myproject2:latest
```

This restores the application files and runtime environment that were copied into the image during `docker build`.

The source code is restored separately from GitHub:

```powershell
git clone https://github.com/mourice-dev/myproject2.git
cd myproject2
```

The complete recovery model is:

| Resource | Where it is stored | What it contains |
|---|---|---|
| Source repository | GitHub | Application source and project configuration |
| Docker image | GHCR | Built application and its runtime dependencies |
| Runtime data | Docker volumes or an external service | Database data, uploads, and generated files |

Files created at runtime inside a container are not automatically added to GitHub or GHCR.

## Version image releases

`latest` is convenient but can change. Use versioned tags for reproducible releases:

```powershell
docker tag myproject:latest ghcr.io/mourice-dev/myproject2:1.0.0
docker push ghcr.io/mourice-dev/myproject2:1.0.0
```

Later, pull that exact version:

```powershell
docker pull ghcr.io/mourice-dev/myproject2:1.0.0
docker run -p 3000:3000 ghcr.io/mourice-dev/myproject2:1.0.0
```

After changing the application:

```powershell
docker build -t myproject:latest .
docker tag myproject:latest ghcr.io/mourice-dev/myproject2:1.1.0
docker push ghcr.io/mourice-dev/myproject2:1.1.0
```

## Persist data with a volume

Containers are replaceable. Use a named volume for data that must survive container removal:

```powershell
docker volume create myproject-data
docker run --name myproject-with-data `
  -p 3000:3000 `
  -v myproject-data:/app/data `
  myproject:latest
```

List volumes:

```powershell
docker volume ls
```

The volume is managed by Docker and is separate from the image and Git repository.

## Troubleshooting

### Docker API pipe or daemon error

Error:

```text
failed to connect to the docker API at npipe:...dockerDesktopLinuxEngine
```

This means the Docker CLI is installed, but Docker Desktop's Linux Engine is not running.

Start Docker Desktop, wait until it reports that it is running, and verify:

```powershell
docker info
```

The command must show both a `Client` and a `Server` section. A client version alone does not prove that the engine is running.

### `git remote add` usage error

Incorrect:

```powershell
git remote add https://github.com/mourice-dev/myproject2.git origin main
```

Correct:

```powershell
git remote add origin https://github.com/mourice-dev/myproject2.git
```

### GHCR permission errors

Error:

```text
permission_denied: The token provided does not match expected scopes
```

The token was accepted for login but did not have the package scope required for pushing. Create or update a token with `write:packages`, then refresh the cached login:

```powershell
docker logout ghcr.io
docker login ghcr.io
docker push ghcr.io/mourice-dev/myproject2:latest
```

Another Actions error encountered was:

```text
denied: permission_denied: write_package
```

In that case, the Docker build and registry login succeeded, but GHCR rejected the final package upload. The cause was authorization for the existing package, not the Dockerfile or Node application.

The repository workflow requests:

```yaml
permissions:
  contents: read
  packages: write
```

For the automatic token to work, also check the repository's **Settings → Actions → General** page and allow read and write workflow permissions. If the package was first created by a manual `docker push`, open the package settings under the GitHub account's **Packages** page and connect `myproject2` to the `mourice-dev/myproject2` repository. This grants the repository's Actions token access to the package.

If the automatic token still cannot write to the package, use a repository secret instead:

```yaml
- name: Log in to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.repository_owner }}
    password: ${{ secrets.GHCR_TOKEN }}
```

Create `GHCR_TOKEN` at the repository's **Settings → Secrets and variables → Actions → Secrets** page, not under Variables. The token must belong to `mourice-dev` and have at least `write:packages` (and `read:packages` for pulling private packages).

Never place the actual token value in a workflow:

```yaml
# Incorrect: do not commit a real token
password: ghp_...
```

If a token is pasted into a workflow, chat, issue, pull request, screenshot, or commit, revoke it and replace the value in the `GHCR_TOKEN` repository secret. GitHub does not show a secret's value after it is saved, so verify it by checking the secret name and the successful workflow run.

### `node_modules` accidentally committed

If `node_modules/` was committed before adding it to `.gitignore`, remove it from Git tracking while keeping the local files:

```powershell
git rm -r --cached node_modules
git add .gitignore
git commit -m "Ignore node_modules"
git push
```

### Image name is not recognized by PowerShell

An image reference such as:

```text
ghcr.io/mourice-dev/myproject2:latest
```

is a value, not a command. Use it with `docker pull`, `docker push`, `docker run`, or another Docker subcommand.

### Difference between `GITHUB_TOKEN` and `GHCR_TOKEN`

`GITHUB_TOKEN` is a temporary token generated automatically for each Actions run:

```yaml
username: ${{ github.actor }}
password: ${{ secrets.GITHUB_TOKEN }}
```

It is the preferred option when the GHCR package is connected to the repository and the workflow has `packages: write` permission. It does not require storing a personal token.

`GHCR_TOKEN` is a manually created Personal Access Token stored as an encrypted repository secret:

```yaml
username: ${{ github.repository_owner }}
password: ${{ secrets.GHCR_TOKEN }}
```

It can solve `write_package` failures when the automatic token is not authorized for an existing package, but it must be rotated manually and protected carefully.

The username expressions are also different:

- `github.actor` is the account or automation identity that triggered the run.
- `github.repository_owner` is the stable owner of the repository, `mourice-dev` in this project.

Changing only the username does not grant package permission. The important difference is which token is used as the password.

The current workflow keeps the automatic-token configuration active:

```yaml
username: ${{ github.actor }}
password: ${{ secrets.GITHUB_TOKEN }}
```

The `GHCR_TOKEN` configuration is commented out in the workflow as an alternative. Use only one login configuration at a time. If the automatic token fails again, uncomment the `GHCR_TOKEN` configuration only after creating the repository secret.

## Recommended next learning steps

1. Test the HTTP endpoint with `http://localhost:3000`.
2. Learn `docker ps`, `docker logs`, `docker exec`, `docker stop`, and `docker rm`.
3. Use Docker Compose for the application and a database together.
4. Learn environment variables and secret handling.
5. Add an automated test and a real `npm test` script.
6. Reduce image size with a slim base image and production dependency installation.
7. Use versioned image tags instead of relying only on `latest`.
8. Learn Docker volumes for persistent data.
9. Add GitHub Actions to test, build, and publish the image automatically.
10. Learn how to deploy the image to a Linux server or cloud platform.

## GitHub Actions workflow

The workflow in [`.github/workflows/deploy.yaml`](./.github/workflows/deploy.yaml) automates the CI/CD portion of this project.

### Pull requests to `main`

The workflow:

1. Checks out the repository.
2. Installs Node.js 22.
3. Runs `npm ci` using the committed lock file.
4. Builds the Docker image without publishing it.

This catches dependency and Docker build problems before merging.

### Pushes to `main`

After the verification job succeeds, the workflow:

1. Logs in to GHCR using the token configured in the login step.
2. Builds the image.
3. Publishes `ghcr.io/mourice-dev/myproject2:latest`.
4. Also publishes a commit-SHA tag for that exact build.

The current workflow requests `packages: write` and uses the automatically provided `GITHUB_TOKEN`. If GHCR package access prevents that token from publishing, configure the encrypted `GHCR_TOKEN` repository secret as described in [GHCR permission errors](#ghcr-permission-errors). Keep personal tokens out of workflow files and source code.

After pushing a change to `main`, check the **Actions** tab in the GitHub repository. A successful run means the new image is available with:

```powershell
docker pull ghcr.io/mourice-dev/myproject2:latest
```

## Complete repeatable workflow

```powershell
# 1. Start Docker Desktop, then check the Engine
docker info

# 2. Build and test locally
docker build -t myproject:latest .
docker run --name myproject-web -p 3000:3000 myproject:latest

# 3. Save source code to GitHub
git add .
git commit -m "Update project"
git push

# 4. Publish the image to GHCR
docker tag myproject:latest ghcr.io/mourice-dev/myproject2:latest
docker login ghcr.io
docker push ghcr.io/mourice-dev/myproject2:latest

# 5. Restore it elsewhere
docker pull ghcr.io/mourice-dev/myproject2:latest
docker run --name myproject-restored -p 3000:3000 `
  ghcr.io/mourice-dev/myproject2:latest
```
