import React, { useState } from 'react';
import { Form, Input, Modal } from 'antd';

export default function useInputModal({ title, label, onSubmit }) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState('');

  function show() {
    setVisible(true);
  }

  function onChange(e) {
    setValue(e.target.value);
  }

  function onOk() {
    setVisible(false);
    onSubmit(value);
  }

  function onCancel() {
    setVisible(false);
  }

  const node = (
    <Modal
      title={title}
      visible={visible}
      destroyOnClose={true}
      okButtonProps={{ disabled: !value }}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form hideRequiredMark={true}>
        <Form.Item label={label}>
          <Input
            value={value}
            autoFocus
            allowClear
            onChange={onChange}
            onPressEnter={onOk}
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  return [node, show];
};
