package com.expert.wsensor.expertwirelesssensordemo.view;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

//import com.expert.wsensor.expertwirelesssensordemo.R;
/**
 * @author SF-lpp nb
 */
public class UIHelper {
    public static ProgressDialog showLoading(Context context, String text) {
        final ProgressDialog progressDialog = ProgressDialog.show(context, "", text);
        progressDialog.setOnKeyListener((dialog, keyCode, event) -> {
            if (keyCode == KeyEvent.KEYCODE_BACK && event.getAction() == KeyEvent.ACTION_UP) {
                if (progressDialog != null && progressDialog.isShowing()) {
                    progressDialog.dismiss();
                    return true;
                }
            }
            return false;
        });
        return progressDialog;
    }

    //  对话框布局的View
    private static View dialogView;

//    private static Dialog createMsgDialog(Context context) {
//        Dialog dialog = createMsgDialog(context, R.layout.srcb_dialog);
//        return dialog;
//    }
    private static Dialog createMsgDialog(Context context, Integer res) {
        dialogView = LayoutInflater.from(context).inflate(res, null);
//        AlertDialog.Builder builder = new AlertDialog.Builder(context);
//        builder.setView(res);
//        SrcbDialog dialog = new SrcbDialog.Builder(context)
//                .setTheme(R.style.SrcbDialog)
//                .setHeightDimenRes(R.dimen.dilog_height)
//                .setWidthDimenRes(R.dimen.dilog_width)
//                .cancelTouchOutside(false)
//                .setDialogLayout(dialogView).build();
//        return dialog;
        return null;
    }



    /**
     * 显示只有确定按钮的弹框
     *
     * @param context  显示内容
     * @param listener listener
     * @return Dialog
     */
    public static Dialog showConfirmDialog(Context context, String title, String content, final ConfirmClickListener listener) {
//        Dialog dialog = createMsgDialog(context,R.layout.layout_confirm_dialog);
//        ((TextView) dialogView.findViewById(R.id.tv_dialog_title)).setText(title);
//        ((TextView) dialogView.findViewById(R.id.tv_dialog_content)).setText(content);
//        EditText et_dialog_content = (EditText) dialogView.findViewById(R.id.et_dialog_content);
//        et_dialog_content.setVisibility(View.GONE);
//        TextView tv_confirm= (TextView) dialogView.findViewById(R.id.tv_confirm);
//        tv_confirm.setOnClickListener(view -> {
//            dialog.dismiss();
//            if(listener!=null) {
//                listener.onConfirmClick();
//            }
//        });
//        dialog.show();
//        return dialog;
        return null;
    }


    public interface DialogClickListener {
        void onCancelClick();
        void onConfirmClick();
    }

    public interface PasswordDialogClickListener {
        void isPasswordRight(Boolean isPasswordRight);
    }

    public interface ConfirmClickListener {
        void onConfirmClick();
    }



}
