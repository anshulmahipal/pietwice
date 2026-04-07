import { StyleSheet } from 'react-native';
import { financeColors } from '../ui/financeTheme';

/** Shared add-sheet and list modals for profile finance hubs (investments, insurance). */
export const financeEntityHubModalStyles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: financeColors.background,
  },
  headerAddButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
  },
  headerAddButtonPressed: {
    opacity: 0.6,
  },
  headerAddInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerAddLabel: {
    fontSize: 17,
    color: financeColors.accent,
    fontWeight: '700',
  },
  addSheetRoot: {
    flex: 1,
  },
  addSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45,36,28,0.3)',
  },
  addSheetKeyboard: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  addSheetPanel: {
    backgroundColor: financeColors.surfaceStrong,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '88%',
  },
  addSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: financeColors.border,
    marginBottom: 12,
  },
  addSheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: financeColors.text,
  },
  addSheetCloseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  addSheetCloseBtnPressed: {
    opacity: 0.5,
  },
  addSheetCloseLabel: {
    fontSize: 18,
    color: financeColors.textMuted,
    fontWeight: '600',
  },
  addSheetHint: {
    fontSize: 14,
    color: financeColors.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: financeColors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  inputDay: {
    minHeight: 44,
    alignSelf: 'flex-start',
    minWidth: 120,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  error: {
    marginTop: 10,
    fontSize: 14,
    color: financeColors.danger,
  },
  addButton: {
    marginTop: 16,
    alignSelf: 'stretch',
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: financeColors.accent,
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  allListEmpty: {
    fontSize: 15,
    color: financeColors.textMuted,
    marginBottom: 16,
    lineHeight: 22,
  },
  dayDetailSubtitle: {
    fontSize: 14,
    color: financeColors.textMuted,
    marginBottom: 12,
  },
  dayDetailList: {
    maxHeight: 280,
    marginBottom: 12,
  },
  dayDetailRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: financeColors.border,
  },
  dayDetailName: {
    fontSize: 16,
    fontWeight: '700',
    color: financeColors.text,
  },
  dayDetailMeta: {
    marginTop: 4,
    fontSize: 14,
    color: financeColors.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(45,36,28,0.3)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: financeColors.surfaceStrong,
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: financeColors.text,
    marginBottom: 8,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    minWidth: 100,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  modalBtnPressed: {
    opacity: 0.85,
  },
  modalCloseBtn: {
    backgroundColor: financeColors.accent,
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
