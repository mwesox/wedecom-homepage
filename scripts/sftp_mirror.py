#!/usr/bin/env python3
"""Mirror a local directory to an SFTP remote, deleting remote files that
are not present locally. Reads credentials from env vars; intended for CI."""
from __future__ import annotations

import os
import posixpath
import stat
import sys
from pathlib import Path

import paramiko


def env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        sys.exit(f"missing env: {name}")
    return value


def ensure_remote_dir(sftp: paramiko.SFTPClient, remote_dir: str) -> None:
    parts = [p for p in remote_dir.split("/") if p]
    cur = "/" if remote_dir.startswith("/") else ""
    for part in parts:
        cur = posixpath.join(cur, part) if cur else part
        try:
            sftp.stat(cur)
        except FileNotFoundError:
            sftp.mkdir(cur)


def upload_tree(sftp: paramiko.SFTPClient, local_root: Path, remote_root: str) -> set[str]:
    uploaded: set[str] = set()
    ensure_remote_dir(sftp, remote_root)
    uploaded.add(remote_root.rstrip("/") or "/")

    for local_path in sorted(local_root.rglob("*")):
        rel = local_path.relative_to(local_root).as_posix()
        remote_path = posixpath.join(remote_root, rel)
        if local_path.is_dir():
            ensure_remote_dir(sftp, remote_path)
        else:
            ensure_remote_dir(sftp, posixpath.dirname(remote_path))
            sftp.put(str(local_path), remote_path)
            print(f"put  {rel}")
        uploaded.add(remote_path)
    return uploaded


def list_remote(sftp: paramiko.SFTPClient, remote_root: str) -> list[str]:
    found: list[str] = []

    def walk(path: str) -> None:
        for entry in sftp.listdir_attr(path):
            full = posixpath.join(path, entry.filename)
            if stat.S_ISDIR(entry.st_mode):
                walk(full)
                found.append(full)
            else:
                found.append(full)

    walk(remote_root)
    return found


def main() -> int:
    if len(sys.argv) != 2:
        sys.exit("usage: sftp_mirror.py <local_dir>")
    local_root = Path(sys.argv[1]).resolve()
    if not local_root.is_dir():
        sys.exit(f"not a directory: {local_root}")

    host = env("SFTP_HOST")
    port = int(env("SFTP_PORT"))
    user = env("SFTP_USER")
    password = env("SFTP_PASSWORD")
    remote_root = env("SFTP_REMOTE_PATH").rstrip("/") or "/"

    print(f"connecting to {user}@{host}:{port}")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        hostname=host,
        port=port,
        username=user,
        password=password,
        allow_agent=False,
        look_for_keys=False,
        timeout=30,
    )
    try:
        sftp = client.open_sftp()
        try:
            uploaded = upload_tree(sftp, local_root, remote_root)
            existing = list_remote(sftp, remote_root)
            stale_files = [p for p in existing if p not in uploaded]
            stale_files.sort(key=lambda p: p.count("/"), reverse=True)
            for path in stale_files:
                try:
                    attr = sftp.stat(path)
                    if stat.S_ISDIR(attr.st_mode):
                        sftp.rmdir(path)
                    else:
                        sftp.remove(path)
                    print(f"del  {path}")
                except FileNotFoundError:
                    pass
        finally:
            sftp.close()
    finally:
        client.close()
    print("deploy complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
