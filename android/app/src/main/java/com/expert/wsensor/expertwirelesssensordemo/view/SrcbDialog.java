package com.expert.wsensor.expertwirelesssensordemo.view;

import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
/**
 * @author SF-lpp nb
 */
public class SrcbDialog extends Dialog {
    private int height;
    private int width;
    private boolean cancelTouchOutside;
    private View dialogView;

    private SrcbDialog(Builder builder) {
        super(builder.context);
        height = builder.height;
        width = builder.width;
        cancelTouchOutside = builder.cancelTouchOutside;
        dialogView = builder.mDialogView;
    }


    private SrcbDialog(Builder builder, int resStyle) {
        super(builder.context, resStyle);
        height = builder.height;
        width = builder.width;
        cancelTouchOutside = builder.cancelTouchOutside;
        dialogView = builder.mDialogView;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(dialogView);

        setCanceledOnTouchOutside(cancelTouchOutside);

        Window win = getWindow();
        WindowManager.LayoutParams lp = win.getAttributes();
        lp.gravity = Gravity.CENTER;
        lp.height = height;
        lp.width = width;
        win.setAttributes(lp);
    }

    public static final class Builder {

        private Context context;
        private int height, width;
        private boolean cancelTouchOutside;
        private View mDialogView;
        private int resStyle = -1;

        public Builder(Context context) {
            this.context = context;
        }

        /**
         * @param dialogView  关联dialog布局文件的View
         * @return
         */
        public Builder setDialogLayout(View dialogView){
            this.mDialogView =dialogView;
            return this;
        }

        public Builder setHeightpx(int val) {
            height = val;
            return this;
        }

        public Builder setWidthpx(int val) {
            width = val;
            return this;
        }

        /**
         * 设置弹窗高度
         * @param dimenRes
         * @return
         */
        public Builder setHeightDimenRes(int dimenRes) {
            height = context.getResources().getDimensionPixelOffset(dimenRes);
            return this;
        }

        /**
         * 设置弹窗宽度
         * @param dimenRes
         * @return
         */
        public Builder setWidthDimenRes(int dimenRes) {
            width = context.getResources().getDimensionPixelOffset(dimenRes);
            return this;
        }

        /**
         * 设置主题
         * @param resStyle
         * @return
         */
        public Builder setTheme(int resStyle) {
            this.resStyle = resStyle;
            return this;
        }

        /**
         * 设置点击dialog外部是否取消dialog
         * @param val
         * @return
         */
        public Builder cancelTouchOutside(boolean val) {
            cancelTouchOutside = val;
            return this;
        }

        /**
         * 给dialog中的view添加点击事件
         * @param viewRes   被点击view的id
         * @param listener
         * @return
         */
        public Builder addViewOnclick(int viewRes,View.OnClickListener listener){
            mDialogView.findViewById(viewRes).setOnClickListener(listener);
            return this;
        }

        public SrcbDialog build() {
            if (resStyle != -1) {
                return new SrcbDialog(this, resStyle);
            } else {
                return new SrcbDialog(this);
            }
        }
    }
}
