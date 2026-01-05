; build/installer.nsh
!include "LogicLib.nsh"

!define APPDIR "Apiflow"

; RTrim 函数：去掉字符串末尾的空格
!macro RTrim ResultVar String
  Push "${String}"
  Call RTrimFunc
  Pop ${ResultVar}
!macroend
!define RTrim "!insertmacro RTrim"

Function RTrimFunc
  Exch $0
  Push $1
  Push $2
  StrLen $1 $0
  IntOp $2 $1 - 1
  loop:
    ${If} $2 < 0
      Goto done
    ${EndIf}
    StrCpy $1 $0 1 $2
    ${If} $1 == " "
      IntOp $2 $2 - 1
      Goto loop
    ${EndIf}
  done:
  IntOp $2 $2 + 1
  StrCpy $0 $0 $2
  Pop $2
  Pop $1
  Exch $0
FunctionEnd

; StrCase 函数：转换字符串大小写
!macro StrCase ResultVar String Case
  Push "${String}"
  Push "${Case}"
  Call StrCaseFunc
  Pop ${ResultVar}
!macroend
!define StrCase "!insertmacro StrCase"

Function StrCaseFunc
  Exch $0
  Exch
  Exch $1
  Push $2
  Push $3
  Push $4
  StrLen $2 $1
  StrCpy $3 0
  loop_case:
    ${If} $3 >= $2
      Goto done_case
    ${EndIf}
    StrCpy $4 $1 1 $3
    ${If} $0 == "L"
      System::Call 'user32::CharLowerA(t r4 r4)i.r4'
    ${Else}
      System::Call 'user32::CharUpperA(t r4 r4)i.r4'
    ${EndIf}
    StrCpy $1 $1 $3
    StrCpy $1 "$1$4"
    IntOp $2 $2 + 1
    IntOp $3 $3 + 1
    ${If} $3 < $2
      StrCpy $4 $1 "" $3
      StrCpy $1 "$1$4"
    ${EndIf}
    Goto loop_case
  done_case:
  StrCpy $0 $1
  Pop $4
  Pop $3
  Pop $2
  Pop $1
  Exch $0
FunctionEnd

Function .onVerifyInstDir
  ; 1) 去掉末尾空格（防止用户输入 "D:\demo   "）
  ${RTrim} $INSTDIR $INSTDIR

  ; 2) 处理用户只输入盘符 "D:" → "D:\"
  StrLen $0 $INSTDIR
  ${If} $0 == 2
    StrCpy $INSTDIR "$INSTDIR\"
  ${EndIf}

  ; 3) 去掉末尾 "\"（统一拼接，避免 "D:\demo\" + "\Apiflow" 变成双斜杠）
  StrLen $0 $INSTDIR
  ${If} $0 > 3
    StrCpy $1 $INSTDIR 1 -1
    ${If} $1 == "\"
      StrCpy $INSTDIR $INSTDIR -1
    ${EndIf}
  ${EndIf}

  ; 4) 如果已经以 "\Apiflow" 结尾，就不再追加（忽略大小写）
  ;    做法：把路径和目标都转小写比较
  StrCpy $2 $INSTDIR
  ${StrCase} $2 $2 "L"
  StrCpy $3 "\${APPDIR}"
  ${StrCase} $3 $3 "L"

  ; 检查是否包含末尾 "\apiflow"
  StrLen $4 $2
  StrLen $5 $3
  IntOp $6 $4 - $5
  ${If} $6 >= 0
    StrCpy $7 $2 $5 $6
    ${If} $7 == $3
      Return
    ${EndIf}
  ${EndIf}

  ; 5) 统一追加 "\Apiflow"
  ;    注意：如果是根目录 "D:\"，此时 $INSTDIR 长度=3，末尾是 "\"，直接拼接即可
  StrLen $0 $INSTDIR
  ${If} $0 == 3
    StrCpy $INSTDIR "$INSTDIR${APPDIR}"
  ${Else}
    StrCpy $INSTDIR "$INSTDIR\${APPDIR}"
  ${EndIf}
FunctionEnd
