/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class LiferayCustomElementReact extends HTMLElement {
	connectedCallback() {
		this.root = createRoot(this);
		this.root.render(<App />);
	}

	disconnectedCallback() {
		this.root?.unmount();
	}
}

if (!customElements.get('liferay-custom-element-react')) {
	customElements.define(
		'liferay-custom-element-react',
		LiferayCustomElementReact
	);
}

