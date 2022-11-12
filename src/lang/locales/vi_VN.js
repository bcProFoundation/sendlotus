/* eslint-disable import/no-anonymous-default-export */
/* SendLotus Language Texts

Table of Contents

01.General
02.Account
03.Lixi
04.Claim
05.Settings
06.Countries
07.Onboarding
08.Notification
*/

export default {
  'en': 'Tiếng Anh',
  'vi': 'Tiếng Việt',
  'language': 'Ngôn ngữ',

  'wallet.RecentTransaction': 'Giao dịch gần đây',
  'wallet.Wallet': 'Ví',
  'wallet.SentTo': 'Gửi đến:',
  'wallet.Tokens': 'Tokens',
  'wallet.Send': 'Gửi',
  'wallet.Settings': 'Cài đặt',
  'wallet.ExternalMessage': 'Tin nhắn',
  'wallet.Reply': 'Trả lời',
  'wallet.Lixi': 'Lixi',
  'wallet.CongratulationMessage': 'Chào mừng bạn đến với SendLotus!',
  'wallet.StartUsingMessageLine1': 'Bắt đầu sử dụng ví ngay lập tức để nhận, thanh toán',
  'wallet.StartUsingMessageLine2': 'hoặc nạp',
  'wallet.StartUsingMessageLine3': 'vào ví của bạn',

  'send.PushNotificationTitle': 'Nhận thông báo',
  'send.PushNotificationConfirmation': 'Bạn có muốn nhận thông báo về các giao dịch mới cho ví của mình không?',
  'send.Yes': 'Có',
  'send.No': 'Không',
  'send.PermisionError': 'Lỗi - Không có quyền truy cập',
  'send.TickerAddressNotValid': 'Địa chỉ {ticker} không khả dụng',
  'send.TransactionSuccessful': 'Giao dịch thành công. bấm vào để xem thông tin giao dịch',
  'send.TransactionFail': 'Giao dịch thất bại, không thấy phản hồi từ {restUrl}.',
  'send.CouldNotCommunicateWithAPI': 'Không thể kết nối với máy chủ, vui lòng thử lại.',
  'send.CanNotSendMessage': 'Địa chỉ này chưa có giao dịch gửi đi, bạn không thể gửi tin nhắn.',
  'send.NewAddressWarning': 'Địa chỉ mới được tạo, Hãy kiểm tra thật kĩ thông tin trước khi thực hiện giao dịch.',
  'send.InvalidAddress': 'Địa chỉ {ticker} không hợp lệ',
  'send.NotSupportAddress': 'Địa chỉ token không phù hợp để gửi {ticker}',
  'send.CannotSendToYourself': 'Không thể gửi cho chính mình!',
  'send.UnableCalculateMaxValue': 'Lỗi mạng! Không thể tính toán giá trị tối đa',
  'send.SendConfirmation': 'Bạn có chắc muốn gửi {formDataValue} {ticker} tới địa chỉ {formDataAddress}?',
  'send.HaveZeroTicker': 'Bạn có 0 {ticker}',
  'send.DepositFund': 'Hãy nạp Token để sử dụng tính năng này', 
  'send.TickerAddress': 'Địa chỉ {ticker}', 
  'send.Amount': 'Số lượng',
  'send.OptionalPrivateMessage': 'Tin nhắn (không bắt buộc)',
  'send.SendButton': 'Gửi',
  'send.SendOnlyMessage': 'Chỉ gửi tin nhắn',
  'send.TooManyUnModalMessage': 'Bạn đang cố tạo quá nhiều giao dịch {ticker} một lần (tối đa 50). Quá trình gửi sẽ được thực thi sau khi block được tạo. Hãy thử lại sau 10 phút.',
  'send.AlertQueryParam': 'Bạn đang thực hiện một dao dịch đến địa chỉ tòn tại các tham số truy vấn"{queryStringText}." Hãy nhập cụ thể số lượng {ticker} để thực hiện giao dịch.',

  'enhanceInput.HigherFee': 'Phí gửi cao hơn',
  'enhanceInput.TransactionAttached': 'Giao dịch có tin nhắn đính kèm sẽ phải chịu',
  'enhanceInput.Encryption': 'Mã hóa',
  'enhanceInput.MessageEncrypted': 'Tin nhắn được mã hóa và chỉ người nhận dự kiến mới có thể đọc được.',
  'enhanceInput.EncryptedMessageSentTo': 'Tin nhắn được mã hóa chỉ có thể được gửi đến',
  'enhanceInput.WalletLeastTransaction': 'ví có ít nhất 1 giao dịch gửi đi.',
  'enhanceInput.MessageLength': 'Độ dài tin nhắn',
  'enhanceInput.DependingLanguage': 'Tùy thuộc vào ngôn ngữ của bạn,',
  'enhanceInput.EachCharacrterByte': 'mỗi ký tự có thể chiếm từ 1 đến 4 byte.',
  'enhanceInput.EncryptedMaxLength': 'Độ dài tối đa của tin nhắn được mã hóa là 206 byte.',

  'setting.ImportMessage': 'Chép và dán cụm từ bảo mật gốc vào phần bên dưới để nhập dữ liệu một ví đã có sẵn',
  'setting.RenameWalletTitle': 'Đổi tên ví {walletName}',
  'setting.RenameWalletSuccess': 'Ví "{walletToBeRenamed}" sẽ đổi tên thành "{newWalletName}"',
  'setting.RenameWalletFailed': 'Đổi tên không thành công. Ví đã tồn tại.',
  'setting.DeleteWalletSuccess': 'Ví "{walletToBeDeleted}" đã được xóa',
  'setting.DeleteWalletFailed': 'Xảy ra lỗi trong quá trình xóa {walletToBeDeleted}.',
  'setting.DeleteWalletConfirmation': 'Bạn có chắc muốn xóa ví "{walletToBeDeleted}"?',
  'setting.InvalidWalletError': 'Tên ví phải dài từ 1 đến 24 kí tự',
  'setting.EnterWalletName': 'Nhập tên ví',
  'setting.ConfirmNotMatchError': 'Vui lòng nhập chính xác cụm từ xác nhận',
  'setting.DeleteConfirmation': 'Nhập "delete {walletToBeDeleted}" để xác nhận',
  'setting.KeepSeedPhraseWarning': 'Cụm từ bảo mật gốc là chìa khóa duy nhất để bạn lấy lại ví. Viết ra và lưu cụm từ bảo mật gốc ở nơi an toàn.',
  'setting.SeeSeedPhrase': 'Nhấp vào để hiển thị cụm từ bảo mật gốc',
  'setting.DownloadQRCode': 'Tải QR code',
  'setting.BackupYourWallet': 'Sao lưu ví của bạn',
  'setting.ManageWallets': 'Quản lý ví',
  'setting.NewWallet': 'Tạo ví mới',
  'setting.ImportWallet': 'Khôi phục ví',
  'setting.ValidSeedPhraseRequired': 'BẠn phải nhập đúng cụm từ bảo mật gốc để khôi phục ví',
  'setting.Mnemonic': 'Cụm từ bảo mật gốc',
  'setting.Import': 'Khôi phục',
  'setting.CurrentlActive': 'Ví đang kích hoạt',
  'setting.Activate': 'Kích hoạt',
  'setting.GeneralSettings': 'Cài đặt chung',
  'setting.LockApp': 'Cài đặt khóa ứng dụng',
  'setting.NotSupported': 'Không hỗ trợ',
  'setting.GotIt': 'Tôi biết rồi!',
  'setting.HowEnableNotification': 'Làm thế nào để bật thông báo',
  'setting.DeviceSupport': 'Tính năng này hoạt động tốt nhất với Chrome hoặc Brave trên thiết bị Android',
  'setting.NotSupportIos': 'Tính năng này không hoạt động trên IOS và Safari trên MacOS',
  'setting.TwoStepEnableNotification': '2 bước để bật thông báo',
  'setting.AllowNotification': 'Cho phép thông báo cho',
  'setting.ForBrowser': 'trình duyệt trên thiết bị của bạn',
  'setting.ThenAllowNotification': 'Sau đó cho phép thông báo cho',
  'setting.SendlotusOnBrower': 'sendlotus.com trên trình duyệt của bạn',
  'setting.EnableNotification': 'Bật thông báo',
  'setting.GrantPermisson': 'Bạn sẽ được nhắc cấp quyền cho thông báo, Vui lòng nhấp vào "Cho phép"',
  'setting.OK': 'OK',
  'setting.PermisionError': 'Lỗi - Không có quyền truy cập',
  'setting.Notification': 'Thông báo',
  'setting.BlockedDevice': 'Bị khóa bởi thiết bị của bạn',

  'lixi.ClaimCode': 'Mã nhận Lì xì',
  'lixi.Redeem': 'Nhận'
};
