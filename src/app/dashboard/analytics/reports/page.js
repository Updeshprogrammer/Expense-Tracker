'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const generateReport = async (format) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportType === 'monthly') {
        params.append('month', selectedMonth);
      }
      params.append('year', selectedYear);
      params.append('format', format);

      const response = await fetch(`/api/reports?${params.toString()}`);
      const data = await response.json();

      if (format === 'pdf') {
        generatePDF(data);
      } else if (format === 'excel') {
        generateExcel(data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(16);
    doc.text('Expense Report', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Period: ${data.period}`, 20, yPos);
    yPos += 10;
    doc.text(`Total Expenses: $${data.totalExpenses.toFixed(2)}`, 20, yPos);
    yPos += 10;
    doc.text(`Total Count: ${data.totalCount}`, 20, yPos);
    yPos += 15;

    // Category Summary
    doc.setFontSize(14);
    doc.text('Category Summary', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    data.categorySummary.forEach((cat) => {
      doc.text(`${cat.category}: $${cat.amount.toFixed(2)}`, 25, yPos);
      yPos += 7;
    });

    yPos += 10;

    // Expenses Table
    doc.setFontSize(14);
    doc.text('Expenses', 20, yPos);
    yPos += 10;

    doc.setFontSize(8);
    doc.text('Title', 20, yPos);
    doc.text('Category', 70, yPos);
    doc.text('Amount', 120, yPos);
    doc.text('Date', 150, yPos);
    yPos += 7;

    data.expenses.slice(0, 20).forEach((exp) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(exp.title.substring(0, 25), 20, yPos);
      doc.text(exp.category.substring(0, 15), 70, yPos);
      doc.text(`$${exp.amount.toFixed(2)}`, 120, yPos);
      doc.text(new Date(exp.date).toLocaleDateString(), 150, yPos);
      yPos += 7;
    });

    doc.save(`expense-report-${data.period.replace(/\s+/g, '-')}.pdf`);
  };

  const generateExcel = (data) => {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Period', data.period],
      ['Total Expenses', `$${data.totalExpenses.toFixed(2)}`],
      ['Total Count', data.totalCount],
      [],
      ['Category', 'Amount'],
      ...data.categorySummary.map((cat) => [
        cat.category,
        `$${cat.amount.toFixed(2)}`,
      ]),
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Expenses Sheet
    const expensesData = [
      ['Title', 'Description', 'Category', 'Amount', 'Date'],
      ...data.expenses.map((exp) => [
        exp.title,
        exp.description || '',
        exp.category,
        exp.amount,
        new Date(exp.date).toLocaleDateString(),
      ]),
    ];
    const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');

    XLSX.writeFile(
      workbook,
      `expense-report-${data.period.replace(/\s+/g, '-')}.xlsx`
    );
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Download Reports
      </h1>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl dark:bg-gray-800">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Month
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(selectedYear, month - 1).toLocaleString('default', {
                      month: 'long',
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              min="2020"
              max="2100"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => generateReport('pdf')}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={() => generateReport('excel')}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Download Excel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

