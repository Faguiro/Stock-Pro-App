// components/SalesReport.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Stack,
  useToast,

} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';


import api from '../lib/api';

const SalesReport: React.FC = () => {
  const toast = useToast();
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const downloadFile = async (type: 'pdf' | 'excel') => {
  try {
    if (type === 'pdf') setLoadingPDF(true);
    else setLoadingExcel(true);

    const endpoint =
      type === 'pdf' ? '/sales/report-pdf' : '/sales/report-excel';

    const response = await api.get(endpoint, {
      responseType: 'blob',
      headers: {
        Accept:
          type === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      type === 'pdf' ? 'relatorio_vendas.pdf' : 'relatorio_vendas.xlsx'
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Download iniciado.',
      description: `Relatório de vendas (${type.toUpperCase()}) gerado com sucesso.`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  } catch (error) {
    console.error(`Erro ao gerar relatório ${type.toUpperCase()}`, error);
    toast({
      title: 'Erro ao gerar relatório.',
      description: 'Não foi possível gerar o relatório. Tente novamente.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setLoadingPDF(false);
    setLoadingExcel(false);
  }
};


  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" shadow="md">
      <Heading as="h2" size="lg" mb={4}>
        Relatórios de Vendas
      </Heading>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
        <Button
          leftIcon={<DownloadIcon />}
          colorScheme="blue"
          onClick={() => downloadFile('pdf')}
          isLoading={loadingPDF}
          loadingText="Gerando PDF..."
        >
          Baixar PDF
        </Button>

        <Button
          leftIcon={<DownloadIcon />}
          colorScheme="green"
          onClick={() => downloadFile('excel')}
          isLoading={loadingExcel}
          loadingText="Gerando Excel..."
        >
          Baixar Excel
        </Button>
      </Stack>
    </Box>
  );
};

export default SalesReport;
