---
title: 'mercury'
year: 2026
brief: 'A personal Arch Linux distribution — two scripts that turn a blank disk into a complete, encrypted, fully-configured Hyprland desktop with no manual steps.'
role: 'solo project'
stack: ['Bash', 'Hyprland', 'Quickshell · QML', 'systemd-boot', 'PipeWire']
highlights:
    - 'Full LUKS2 disk encryption end to end, from the initramfs hook to the bootloader entry'
    - 'Desktop shell — bar, notifications, launcher, lock screen — built from scratch in Quickshell/QML'
    - 'Snapshot-driven VM test loop: a full reinstall takes about twelve minutes'
    - 'Plain-text package manifests and versioned migrations for machines already installed'
links: {}
featured: true
---

mercury started as a deliberate exercise in doing things the hard way: a raw Arch install, partitioned and bootstrapped by hand, so that every layer of the system — the LUKS container, the initramfs hooks, the bootloader entry, the compositor — is something I understand rather than something a tool did for me. Each step was then codified into the install script, which makes the repo less a configuration and more a written record of how the machine actually works.

Omarchy is the reference point — a well-made system that's the source of several structural ideas here, like plain-text package manifests and versioned migrations for machines already installed. But mercury cherry-picks rather than clones: the choices are mine to defend, and anything I can't justify doesn't ship. The clearest expression of that is the desktop shell, built entirely from scratch in Quickshell rather than configured on top of someone else's status bar.

The system is grown rather than installed: bare Hyprland first, snapshot, then one component at a time, with a rescue keybind that never depends on the shell — so a broken experiment is never a reboot. It's developed inside a virt-manager VM, where snapshots make a full reinstall a twelve-minute experiment instead of a weekend.
