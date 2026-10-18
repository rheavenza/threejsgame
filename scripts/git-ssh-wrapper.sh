#!/usr/bin/env bash
# Git SSH wrapper for this machine.
#
# The system-wide ssh config is unreadable here: /etc/ssh/ssh_config.d/*.conf
# (including the 20-systemd-ssh-proxy.conf symlink) are owned by nfsnobody
# rather than root, so OpenSSH aborts with:
#   "Bad owner or permissions on /etc/ssh/ssh_config.d/20-systemd-ssh-proxy.conf"
# which breaks every `git fetch` / `git push` over SSH.
#
# `-F /dev/null` makes ssh ignore the system config entirely; the user config
# and ~/.ssh/id_ed25519 are still used, and GitHub SSH auth works.
#
# Remove this wrapper (and the core.sshCommand setting) if the OS-level file
# ownership is ever repaired.
exec ssh -F /dev/null "$@"
