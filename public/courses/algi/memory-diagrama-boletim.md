# Diagrama de Memória — Boletim TechED (Matriz 2D)

```
Endereço base -> boletim[0][0]
+-------------------------------+
| Aluno 0 | Disc 0 | Nota 7.5   |
|         | Disc 1 | Nota 6.0   |
|         | Disc 2 | Nota 8.0   |
|         | Disc 3 | Nota 7.0   |
+-------------------------------+
| Aluno 1 | Disc 0 | Nota 5.0   |
|         | Disc 1 | Nota 6.5   |
|         | Disc 2 | Nota 6.8   |
|         | Disc 3 | Nota 7.2   |
+-------------------------------+
| ...                             |
+-------------------------------+
```

- As notas são armazenadas de forma contígua em memória (linha major order).
- A transposição cria uma segunda matriz `boletimT` que reorganiza os blocos por disciplina para os slides das aulas 33 e 34.
- Inclua os rótulos de cabeçalho nos slides: linha = estudante, coluna = disciplina.
