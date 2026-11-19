
import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Mail,
  BriefcaseBusiness,
  Settings,
  LogOut,
  X,
  ChevronRight
} from "lucide-react";

import "./ProfilePanel.css";

const SETTINGS_KEY = "nexora_settings_v1";

function getProfileData() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );

    return {
      name: saved.profile?.name || "Ibrahim",
      email: saved.profile?.email || "",
      workspace: saved.profile?.workspace || "Personal Workspace"
    };
  } catch {
    return {
      name: "Ibrahim",
      email: "",
      workspace: "Personal Workspace"
    };
  }
}

function ProfilePanel({ onClose }) {
  const [profile, setProfile] = useState(getProfileData);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setProfile(getProfileData());
    };

    const handleStorageUpdate = (event) => {
      if (!event.key || event.key === SETTINGS_KEY) {
        setProfile(getProfileData());
      }
    };

    window.addEventListener(
      "nexora:settings-updated",
      handleSettingsUpdate
    );

    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener(
        "nexora:settings-updated",
        handleSettingsUpdate
      );

      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "I";

  const openSettings = () => {
    onClose();

    window.dispatchEvent(
      new CustomEvent("nexora:navigate", {
        detail: "Settings"
      })
    );
  };

  return (
    <div className="profile-panel-overlay">
      <div
        className="profile-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Profile menu"
      >
        <div className="profile-panel-header">
          <div>
            <span className="profile-panel-eyebrow">
              ACCOUNT
            </span>
            <h3>My Profile</h3>
          </div>

          <button
            className="profile-panel-close"
            onClick={onClose}
            aria-label="Close profile panel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="profile-panel-user">
          <div className="profile-panel-avatar">
            {initials}
          </div>

          <div className="profile-panel-user-info">
            <h4>{profile.name}</h4>
            <p>{profile.email || "No email added yet"}</p>
          </div>
        </div>

        <div className="profile-panel-divider" />

        <div className="profile-panel-details">
          <div className="profile-panel-detail">
            <span className="profile-panel-detail-icon">
              <UserRound size={17} />
            </span>

            <div>
              <small>Display name</small>
              <strong>{profile.name}</strong>
            </div>
          </div>

          <div className="profile-panel-detail">
            <span className="profile-panel-detail-icon">
              <Mail size={17} />
            </span>

            <div>
              <small>Email address</small>
              <strong>{profile.email || "Not provided"}</strong>
            </div>
          </div>

          <div className="profile-panel-detail">
            <span className="profile-panel-detail-icon">
              <BriefcaseBusiness size={17} />
            </span>

            <div>
              <small>Workspace</small>
              <strong>{profile.workspace}</strong>
            </div>
          </div>
        </div>

        <div className="profile-panel-divider" />

        <button
          className="profile-panel-action"
          onClick={openSettings}
        >
          <span className="profile-panel-action-icon">
            <Settings size={18} />
          </span>

          <span>
            <strong>Account settings</strong>
            <small>Manage your profile and preferences</small>
          </span>

          <ChevronRight size={17} />
        </button>

        <div className="profile-panel-footer">
          <span className="profile-panel-footer-icon">
            <LogOut size={15} />
          </span>
          <span>Signed in to NEXORA</span>
        </div>
      </div>
    </div>
  );
}

export default ProfilePanel;
