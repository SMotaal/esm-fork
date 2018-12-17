# Project Structure

This project uses a structured monorepo for development.

## Folder/Package Structure

---

<samp>

<details open><summary><b>./ <kbd>repository</kbd></b> — root</summary><ul>

---

<details open><summary><i>./package.json <kbd>manifest</kbd></i> — defines project workspaces and external dependencies</summary>


```jsx
{
  "workspaces": [ /*  */ ]
}
```
</details>

---

<details open><summary><b>./common <kbd>package</kbd></b> — files required by other packages</summary>
</details>

---

<details open><summary><b>./runtime <kbd>package</kbd></b> — bootstrapping across platforms</summary>
</details>

---

<details open><summary><b>./common <kbd>package</kbd></b> — files required by other packages</summary>
</details>

</details>

---
