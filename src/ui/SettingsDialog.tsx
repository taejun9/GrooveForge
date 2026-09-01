/**
 * 프로젝트 편집과 분리된 앱 환경설정을 제공하는 접근 가능한 모달이다.
 * 현재는 영어와 한국어만 노출하며 선택 즉시 공용 로컬라이제이션 상태와 기기 로컬 저장소를 갱신한다.
 * 포커스 트랩, Escape, 배경 클릭을 같은 닫기 경로로 모아 작업 화면의 실수 입력을 방지한다.
 */
import { Check, CircleAlert, Languages, Settings, X } from "lucide-react";
import { useRef, type ReactElement } from "react";
import { localePersistenceMessageKeys, useLocalization, type AppLocale } from "./localization";
import { useModalFocusTrap } from "./useModalFocusTrap";

const languageOptions: AppLocale[] = ["en", "ko"];

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }): ReactElement | null {
  const { locale, persistence, setLocale, t } = useLocalization();
  const dialogRef = useRef<HTMLElement | null>(null);
  const selectedLanguageRef = useRef<HTMLInputElement | null>(null);
  const persistenceMessages = localePersistenceMessageKeys(persistence);
  useModalFocusTrap(open, dialogRef, selectedLanguageRef, true);

  if (!open) {
    return null;
  }

  return (
    <div
      className="settings-overlay"
      data-testid="settings-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          // 닫힘 cleanup이 opener에 돌려준 포커스를 pointer 기본 동작이 다시 body로 빼앗지 않게 한다.
          event.preventDefault();
          onClose();
        }
      }}
    >
      <section
        aria-describedby="settings-description"
        aria-labelledby="settings-title"
        aria-modal="true"
        className="settings-dialog"
        data-testid="settings-dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="settings-heading">
          <span className="settings-heading-icon" aria-hidden="true">
            <Settings size={19} />
          </span>
          <div>
            <small>{t("settings.kicker")}</small>
            <h2 id="settings-title">{t("settings.title")}</h2>
          </div>
          <button
            aria-label={t("settings.close")}
            className="settings-close"
            data-testid="settings-close"
            onClick={onClose}
            type="button"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <p className="settings-description" id="settings-description">
          {t("settings.description")}
        </p>

        <fieldset className="settings-language" data-testid="settings-language">
          <legend>
            <Languages size={17} aria-hidden="true" />
            <span>
              <strong>{t("settings.language")}</strong>
              <small>{t("settings.languageDetail")}</small>
            </span>
          </legend>
          <div className="settings-language-options">
            {languageOptions.map((option) => {
              const selected = locale === option;
              const name = option === "en" ? t("settings.english") : t("settings.korean");
              const detail = option === "en" ? t("settings.englishDetail") : t("settings.koreanDetail");
              return (
                <label className={selected ? "settings-language-option selected" : "settings-language-option"} key={option}>
                  <input
                    checked={selected}
                    data-testid={`settings-language-${option}`}
                    name="app-language"
                    onChange={() => setLocale(option)}
                    ref={selected ? selectedLanguageRef : undefined}
                    type="radio"
                    value={option}
                  />
                  <span className="settings-language-copy">
                    <strong lang={option}>{name}</strong>
                    <small>{detail}</small>
                  </span>
                  <span className="settings-language-state" aria-hidden="true">
                    {selected ? <Check size={15} /> : option.toUpperCase()}
                  </span>
                  {selected && <span className="sr-only">{t("settings.selected")}</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div
          className={persistence === "device" ? "settings-local-note" : "settings-local-note session-only"}
          data-persistence={persistence}
          data-testid="settings-persistence"
          role="status"
        >
          {persistence === "device" ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <CircleAlert size={16} aria-hidden="true" />
          )}
          <span>
            <strong>{t(persistenceMessages.title)}</strong>
            <small>{t(persistenceMessages.detail)}</small>
          </span>
        </div>

        <footer className="settings-actions">
          <button data-testid="settings-done" onClick={onClose} type="button">
            {t("settings.done")}
          </button>
        </footer>
      </section>
    </div>
  );
}
