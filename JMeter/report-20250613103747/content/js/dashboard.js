/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 92.77899343544858, "KoPercent": 7.2210065645514225};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5201342281879194, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.09523809523809523, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.43478260869565216, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.6857142857142857, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7636363636363637, 500, 1500, "Determine session slug"], "isController": true}, {"data": [0.5, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.40476190476190477, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.7571428571428571, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.21428571428571427, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.1111111111111111, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.918918918918919, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.5, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9375, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.7297297297297297, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.5, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.96875, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.921875, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0945945945945946, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.8333333333333334, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9375, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5634920634920635, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9324324324324325, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.75, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.3225806451612903, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.75, 500, 1500, "5.1 Consent homepage"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 914, 66, 7.2210065645514225, 5549.585339168487, 0, 63310, 473.5, 21381.0, 40846.5, 52142.75000000002, 1.5841076222613917, 31.917366199558565, 1.7339802052623916], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 63, 42, 66.66666666666667, 15987.682539682539, 0, 87514, 3848.0, 55078.8, 71552.79999999999, 87514.0, 0.44757669191093935, 38.50828111235241, 0.7619252213906136], "isController": true}, {"data": ["1.4 Select Organisations", 63, 8, 12.698412698412698, 24389.95238095238, 311, 63310, 21279.0, 49480.8, 50111.6, 63310.0, 0.4400363204581965, 5.569148291803451, 0.6088969843542642], "isController": false}, {"data": ["2.3 Search by first/last name", 23, 2, 8.695652173913043, 4195.869565217392, 648, 43335, 765.0, 21641.000000000047, 41678.199999999975, 43335.0, 0.25971679577226225, 9.045305671847828, 0.22408733894735652], "isController": false}, {"data": ["5.8 Consent confirm", 16, 0, 0.0, 857.125, 740, 1067, 811.5, 1061.4, 1067.0, 1067.0, 0.29994001199760045, 25.325232805001498, 0.6517251237252549], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 4057.6857142857143, 102, 25286, 108.0, 19629.1, 21145.100000000002, 25286.0, 0.8428961913133526, 5.084540794670488, 0.5078778808987682], "isController": false}, {"data": ["Determine session slug", 55, 13, 23.636363636363637, 10898.090909090908, 0, 59643, 0.0, 48529.39999999999, 57505.2, 59643.0, 0.3650919035891853, 0.0, 0.0], "isController": true}, {"data": ["3.0 Nurse triage", 37, 0, 0.0, 1259.432432432433, 1008, 1487, 1285.0, 1461.2, 1477.1, 1487.0, 0.12913313276980098, 15.422414899738593, 0.3850749473869736], "isController": true}, {"data": ["2.4 Patient attending session", 21, 0, 0.0, 1274.8095238095239, 847, 2750, 1006.0, 2596.6000000000004, 2744.7999999999997, 2750.0, 0.5307721470997093, 18.744199616138, 0.7889015702009352], "isController": false}, {"data": ["5.4 Consent route", 16, 0, 0.0, 357.31249999999994, 340, 401, 353.0, 393.3, 401.0, 401.0, 0.3012501882813677, 3.4422393950519656, 0.46864409173068233], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 1722.742857142857, 303, 12216, 319.0, 6864.9, 8123.950000000003, 12216.0, 0.9847642896332457, 5.088269391063967, 0.5337345515102064], "isController": false}, {"data": ["1.3 Sign-in", 70, 7, 10.0, 18632.557142857142, 439, 61749, 13670.0, 46775.7, 50744.5, 61749.0, 0.49308970006057956, 4.35187431319649, 0.7524983578351954], "isController": false}, {"data": ["2.1 Open session", 63, 32, 50.79365079365079, 7349.000000000001, 0, 60098, 800.0, 30885.200000000004, 40624.599999999984, 60098.0, 0.44828371378152215, 3.9955843164740705, 0.16028894509236066], "isController": false}, {"data": ["3.3 Nurse triage complete", 37, 0, 0.0, 324.9459459459459, 251, 633, 285.0, 560.2, 606.0, 633.0, 0.1285061335630236, 3.1427428548853173, 0.08705910674344619], "isController": false}, {"data": ["4.3 Vaccination confirm", 37, 0, 0.0, 767.9729729729729, 683, 1089, 762.0, 881.6000000000001, 1003.5000000000001, 1089.0, 0.1650319582156923, 4.147647569792907, 0.3842847202708308], "isController": false}, {"data": ["5.6 Consent questions", 16, 0, 0.0, 377.99999999999994, 346, 547, 353.5, 542.8, 547.0, 547.0, 0.30612049668050584, 3.6919058631641377, 0.5937063539135592], "isController": false}, {"data": ["4.1 Vaccination questions", 37, 0, 0.0, 474.72972972972974, 356, 589, 552.0, 570.4, 588.1, 589.0, 0.1452489842385224, 1.691199156721691, 0.2933195281370836], "isController": false}, {"data": ["5.3 Consent parent details", 16, 0, 0.0, 357.5625, 342, 394, 351.0, 389.8, 394.0, 394.0, 0.32485330842791305, 3.689099521856537, 0.5395055250441597], "isController": false}, {"data": ["3.1 Nurse triage new", 37, 0, 0.0, 248.08108108108112, 217, 429, 232.0, 301.40000000000043, 428.1, 429.0, 0.12934394652851333, 1.4586424915839038, 0.08914244963451595], "isController": false}, {"data": ["3.2 Nurse triage result", 37, 0, 0.0, 686.4054054054053, 501, 951, 639.0, 938.2, 950.1, 951.0, 0.1288713654791925, 10.786163901084262, 0.20817106498251528], "isController": false}, {"data": ["5.2 Consent who", 16, 0, 0.0, 387.25, 355, 665, 365.5, 481.6000000000002, 665.0, 665.0, 0.2998500749625187, 4.501521212050225, 0.46675880809595205], "isController": false}, {"data": ["1.0 Login", 70, 37, 52.857142857142854, 64010.22857142856, 6540, 108600, 69934.0, 97415.7, 104399.6, 108600.0, 0.46537602382725246, 17.036567024950802, 1.9892877295301032], "isController": true}, {"data": ["5.0 Consent", 16, 0, 0.0, 4131.812499999999, 3895, 4374, 4163.5, 4325.7, 4374.0, 4374.0, 0.2696280817647158, 55.62744613757773, 4.032374854653612], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 32, 0, 0.0, 315.87500000000006, 244, 583, 282.5, 552.8, 566.75, 583.0, 0.21241992764446216, 4.861446042434199, 0.15361030900461348], "isController": false}, {"data": ["4.0 Vaccination", 37, 0, 0.0, 1630.7027027027025, 1408, 1847, 1662.0, 1719.4, 1810.1000000000001, 1847.0, 0.12797631400545112, 6.913683245868441, 0.7598897641863473], "isController": true}, {"data": ["2.5 Patient return to consent page", 21, 0, 0.0, 378.0476190476191, 248, 600, 303.0, 582.8, 598.4, 600.0, 0.5419494696637333, 12.390138293891454, 0.37576574556762754], "isController": false}, {"data": ["5.5 Consent agree", 16, 0, 0.0, 407.875, 353, 677, 364.5, 654.6, 677.0, 677.0, 0.3053260309524264, 5.316892043394462, 0.4693195046085148], "isController": false}, {"data": ["Debug Sampler", 37, 0, 0.0, 0.35135135135135126, 0, 2, 0.0, 1.0, 1.1000000000000014, 2.0, 0.1658545769139394, 0.7361241424309799, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 63, 9, 14.285714285714286, 10173.0, 207, 49851, 413.0, 32242.600000000002, 42939.59999999999, 49851.0, 0.11980648400298186, 1.1239082069580943, 0.07347321314809603], "isController": false}, {"data": ["4.2 Vaccination batch", 37, 0, 0.0, 387.9999999999999, 346, 572, 361.0, 547.8, 558.5, 572.0, 0.14828351808658152, 2.557491486221656, 0.23573588325879083], "isController": false}, {"data": ["5.7 Consent triage", 16, 0, 0.0, 529.5624999999999, 368, 685, 539.0, 682.2, 685.0, 685.0, 0.3069132202869639, 5.021264380562802, 0.5076131862387785], "isController": false}, {"data": ["2.2 Session register", 31, 8, 25.806451612903224, 13322.709677419361, 465, 60097, 1363.0, 50773.40000000001, 55940.79999999999, 60097.0, 0.22325608192778026, 20.424844002063317, 0.13757283954729427], "isController": false}, {"data": ["5.1 Consent homepage", 16, 0, 0.0, 580.5625, 466, 706, 580.0, 695.5, 706.0, 706.0, 0.28054425585636134, 3.540107554749965, 0.5975263886940665], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 26, 39.39393939393939, 2.8446389496717726], "isController": false}, {"data": ["502/Bad Gateway", 38, 57.57575757575758, 4.157549234135668], "isController": false}, {"data": ["504/Gateway Time-out", 2, 3.0303030303030303, 0.2188183807439825], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 914, 66, "502/Bad Gateway", 38, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 26, "504/Gateway Time-out", 2, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["1.4 Select Organisations", 63, 8, "502/Bad Gateway", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.3 Search by first/last name", 23, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.3 Sign-in", 70, 7, "502/Bad Gateway", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.1 Open session", 63, 32, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 26, "502/Bad Gateway", 5, "504/Gateway Time-out", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.5 Open Sessions list", 63, 9, "502/Bad Gateway", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 31, 8, "502/Bad Gateway", 7, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
