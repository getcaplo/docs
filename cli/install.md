# Install the CLI

> Install the caplo command-line tool on macOS, Linux or Windows, check the download, and keep it up to date.

The `caplo` CLI is a single binary for macOS, Linux and Windows on ARM64 (Apple silicon, Graviton) and AMD64 (Intel, AMD). Every release is published on the [Caplo releases page](https://github.com/getcaplo/homebrew-tap/releases) with a checksum file and a signature.

Running tool package fixtures on your machine (`caplo test` and `caplo tool test`) also needs Node.js 24 and the package’s dependencies installed. On Windows those commands run under WSL; everything else works natively.

## Install

**macOS**

With [Homebrew](https://brew.sh):

```sh
brew install getcaplo/tap/caplo
```

Or with the install script, which needs no Homebrew and no `sudo`:

```sh
curl -fsSL https://cli.caplo.si/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
```

Add the `export` line to your shell profile (for example `~/.zshrc`) so `caplo` stays on your `PATH` in new terminals.

**Linux**

With [Homebrew](https://brew.sh):

```sh
brew install getcaplo/tap/caplo
```

Or with the install script. It needs `curl`, `tar` and `sha256sum`; on Ubuntu or Debian install them first with `sudo apt-get install curl ca-certificates tar coreutils`.

```sh
curl -fsSL https://cli.caplo.si/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
```

Add the `export` line to your shell profile (for example `~/.bashrc`) so `caplo` stays on your `PATH` in new terminals.

**Windows**

Windows has no installer. Download the archive and put `caplo.exe` on your `PATH`.

1. Open the [releases page](https://github.com/getcaplo/homebrew-tap/releases) and download `caplo_<VERSION>_windows_amd64.zip` (or `windows_arm64` on an ARM device) and `checksums.txt` from the latest release.

2. [Check the archive](#verify-a-download) against `checksums.txt`.

3. Extract `caplo.exe` to a folder of your own and add that folder to your user `PATH`. In PowerShell, from the download folder:

   ```powershell
   $dir = "$env:LOCALAPPDATA\Programs\caplo"
   Expand-Archive .\caplo_<VERSION>_windows_amd64.zip -DestinationPath $dir
   $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
   [Environment]::SetEnvironmentVariable("Path", "$userPath;$dir", "User")
   ```

4. Open a new terminal so it picks up the new `PATH`.

Use one installation method. If you install with both Homebrew and the script, two copies end up on your `PATH` and the one that runs depends on its order.

## Check the installation

```sh
caplo version
```

It prints the CLI version, the commit it was built from, and the Go version and platform. `caplo --version` prints the version alone, and `caplo version -o json` prints the same details as JSON. Next, [log in](/cli/authentication/).

## Install script options

The script detects your operating system and architecture, downloads the matching archive and `checksums.txt` from the release over HTTPS, checks the archive’s SHA-256 hash, and only then replaces `caplo` in the install directory. It never runs `sudo` and never edits your shell profile. Set these variables on the `sh` side of the pipe:

| Variable            | Default        | Effect                                                                                        |
| ------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| `CAPLO_VERSION`     | `latest`       | The release to install, as `vX.Y.Z`, for example `v0.4.0`. Only stable versions are accepted. |
| `CAPLO_INSTALL_DIR` | `~/.local/bin` | The directory to install `caplo` into. It is created if missing.                              |

To pin both the script and the CLI to one release, fetch the script from that release’s tag:

```sh
curl -fsSL https://raw.githubusercontent.com/getcaplo/homebrew-tap/v0.4.0/install.sh \
  | CAPLO_VERSION=v0.4.0 CAPLO_INSTALL_DIR="$HOME/bin" sh
```

You can also download `install.sh`, read it, and run it yourself. The same script is attached to every release.

## Verify a download

The install script and Homebrew check the SHA-256 hash for you. When you download an archive by hand, check it yourself: download `checksums.txt` from the same release into the folder that holds the archive.

**macOS**

```sh
shasum -a 256 --ignore-missing -c checksums.txt
```

**Linux**

```sh
sha256sum --ignore-missing -c checksums.txt
```

**Windows**

```powershell
(Get-FileHash .\caplo_<VERSION>_windows_amd64.zip -Algorithm SHA256).Hash.ToLower()
Select-String "windows_amd64.zip" .\checksums.txt
```

The two hashes must be identical.

A matching line ends in `OK`. If the hash does not match, delete the archive and download it again.

### Check the signature

Each release also signs `checksums.txt` with a keyless [Sigstore](https://www.sigstore.dev) signature, so you can confirm that Caplo published the checksums and not someone else. Download `checksums.txt.sigstore.json` from the release and verify it with [cosign](https://docs.sigstore.dev/cosign/system_config/installation/):

```sh
cosign verify-blob checksums.txt \
  --bundle checksums.txt.sigstore.json \
  --certificate-identity-regexp '@getcaplo\.com$' \
  --certificate-oidc-issuer https://accounts.google.com
```

It prints `Verified OK`. A verified `checksums.txt` plus a matching hash means the archive is the one Caplo released.

## Update

**macOS**

```sh
brew update && brew upgrade getcaplo/tap/caplo
```

If you used the install script, run it again. It installs the latest release over the old binary.

**Linux**

```sh
brew update && brew upgrade getcaplo/tap/caplo
```

If you used the install script, run it again. It installs the latest release over the old binary.

**Windows**

Download the new archive, check it, and extract `caplo.exe` over the old one.

Your login, settings and selected workspace are kept across updates.

## Uninstall

1. End your session so it stops working on the server too:

   ```sh
   caplo auth logout
   ```

2. Remove the binary: `brew uninstall caplo` for Homebrew, or delete `caplo` from the install directory (`~/.local/bin` by default). On Windows, delete the folder that holds `caplo.exe` and remove it from your `PATH`.

3. Optionally delete the configuration directory: `~/.config/caplo` (or `$XDG_CONFIG_HOME/caplo`) on macOS and Linux, `%AppData%\caplo` on Windows, or the directory `CAPLO_CONFIG_DIR` names. See [Authentication](/cli/authentication/#where-the-session-is-stored) for what it holds.
