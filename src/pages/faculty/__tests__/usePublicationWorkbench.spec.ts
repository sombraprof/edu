import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';

import { TeacherAutomationError } from '../utils/automation';
import { usePublicationWorkbench } from '../controllers/usePublicationWorkbench';

describe('usePublicationWorkbench', () => {
  const statusMock = {
    branch: 'main',
    upstream: 'origin/main',
    ahead: 0,
    behind: 0,
    detached: false,
    clean: true,
    changes: [],
    raw: '## mock status',
  };

  function setup(options = {}) {
    let composable: ReturnType<typeof usePublicationWorkbench>;
    const wrapper = mount(
      defineComponent({
        setup() {
          composable = usePublicationWorkbench(options as never);
          return () => null;
        },
      })
    );
    return { composable: composable!, unmount: () => wrapper.unmount() };
  }

  it('atualiza status do Git com sucesso', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(statusMock);

    const { composable, unmount } = setup({
      automationEnabled: true,
      autoLoadStatus: false,
      automation: { fetchStatus },
    });

    const promise = composable.refreshGitStatus();
    expect(composable.gitStatusLoading.value).toBe(true);
    await promise;

    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(composable.gitStatus.value).toEqual(statusMock);
    expect(composable.gitStatusError.value).toBeNull();
    expect(composable.gitStatusLoading.value).toBe(false);

    unmount();
  });

  it('captura erros ao atualizar status do Git', async () => {
    const fetchStatus = vi
      .fn()
      .mockRejectedValue(new TeacherAutomationError('Serviço indisponível'));

    const { composable, unmount } = setup({
      automationEnabled: true,
      autoLoadStatus: false,
      automation: { fetchStatus },
    });

    await composable.refreshGitStatus();

    expect(composable.gitStatus.value).toBeNull();
    expect(composable.gitStatusError.value).toBe('Serviço indisponível');
    expect(composable.gitStatusLoading.value).toBe(false);

    unmount();
  });

  it('retorna caminhos vazios quando nenhum artefato foi preenchido', () => {
    const { composable, unmount } = setup({
      automationEnabled: false,
      autoLoadStatus: false,
    });

    composable.artifacts[0].path = '   ';

    expect(composable.artifactPaths.value).toEqual([]);

    unmount();
  });
});
