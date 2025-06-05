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

    var data = {"OkPercent": 99.98365011240547, "KoPercent": 0.01634988759452279};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8115734011627908, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.9396984924623115, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.9653266331658291, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.891, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4273461150353179, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.4814070351758794, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9873864783047427, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.9848637739656912, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.478, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9712411705348133, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.4899091826437941, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9376884422110553, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.9767911200807265, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.48688193743693237, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.45, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.9328960645812311, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.950050454086781, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.3663316582914573, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.9557788944723619, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9882629107981221, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9561049445005045, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9525731584258325, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.9838546922300706, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.9656912209889001, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.8075, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9772956609485368, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.986377396569122, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 24465, 4, 0.01634988759452279, 391.3283874923358, 0, 8475, 290.0, 765.0, 1092.9500000000007, 2474.9400000000096, 7.081921315266063, 147.73906113722225, 6.797839482999481], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 70, 0, 0.0, 103.24285714285715, 92, 241, 99.0, 112.0, 124.80000000000001, 241.0, 0.07890631340685898, 0.0572533113879846, 0.06303258238946352], "isController": false}, {"data": ["1.4 Select Organisations-1", 70, 0, 0.0, 140.9142857142857, 107, 858, 119.0, 144.2, 147.45, 858.0, 0.07890471241486746, 1.076386648167269, 0.051010663690080324], "isController": false}, {"data": ["2.0 Register attendance", 999, 0, 0.0, 3188.9709709709705, 1784, 9151, 2851.0, 4595.0, 5543.0, 7699.0, 0.31008108046029814, 48.617418295458855, 1.3507712466648436], "isController": true}, {"data": ["1.3 Sign-in-1", 70, 0, 0.0, 109.71428571428572, 96, 152, 107.0, 127.69999999999999, 135.35000000000002, 152.0, 0.07887297282375383, 0.7093946090886453, 0.05206848596568124], "isController": false}, {"data": ["1.3 Sign-in-0", 70, 0, 0.0, 389.6000000000001, 347, 709, 367.5, 458.5, 563.6500000000001, 709.0, 0.07885129434399665, 0.055981338855552315, 0.07199800801917663], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 244.3, 205, 1019, 218.0, 252.6, 271.35, 1019.0, 0.07889617488802378, 1.1335161376490293, 0.11402962776784688], "isController": false}, {"data": ["2.4 Patient attending session-1", 995, 0, 0.0, 449.80703517587904, 332, 3817, 407.0, 510.5999999999999, 623.3999999999999, 1395.8399999999992, 0.3092677441202607, 11.186127614672284, 0.20658118845533038], "isController": false}, {"data": ["2.4 Patient attending session-0", 995, 0, 0.0, 285.39798994974876, 164, 4931, 217.0, 344.0, 528.3999999999995, 1962.6399999999994, 0.3092175738758076, 0.2297993883979391, 0.2530511004960223], "isController": false}, {"data": ["2.3 Search by first/last name", 1000, 0, 0.0, 496.6360000000006, 336, 4475, 416.0, 620.0, 867.4999999999993, 2294.4900000000034, 0.31033916657175464, 12.255482497782626, 0.2677078388919216], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 103.34285714285713, 89, 446, 95.0, 108.8, 138.00000000000006, 446.0, 0.07889626381107276, 0.47545785544739255, 0.047538080831476454], "isController": false}, {"data": ["3.0 Nurse triage", 991, 0, 0.0, 1301.5277497477314, 819, 7064, 1133.0, 1694.4, 2519.599999999998, 4365.4800000000105, 0.3093220167046374, 35.11509501390701, 0.9290073002805124], "isController": true}, {"data": ["4.2 Vaccination batch-2", 991, 0, 0.0, 0.3340060544904138, 0, 9, 0.0, 1.0, 1.0, 1.0, 0.31070798152682716, 1.550991253695732, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 995, 0, 0.0, 735.3105527638189, 512, 5447, 627.0, 882.5999999999999, 1134.799999999998, 2933.2799999999825, 0.3091780834687606, 11.412654654586712, 0.4595400810932164], "isController": false}, {"data": ["4.2 Vaccination batch-0", 991, 0, 0.0, 169.84863773965685, 102, 2703, 115.0, 279.0, 296.4, 967.2400000000001, 0.31066609820935953, 0.23239280393395445, 0.2791140726099714], "isController": false}, {"data": ["4.2 Vaccination batch-1", 991, 0, 0.0, 187.18768920282548, 124, 3882, 144.0, 209.0, 310.79999999999995, 1302.2000000000048, 0.3106857722218704, 4.220165142733621, 0.2227925816051764], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 285.3428571428571, 258, 517, 272.0, 331.79999999999995, 347.9, 517.0, 0.07892739919561705, 0.40735478979378525, 0.042778033743718226], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 499.49999999999994, 449, 848, 475.5, 562.8, 692.35, 848.0, 0.0788401043842982, 0.7650723801433312, 0.12403457828428165], "isController": false}, {"data": ["2.1 Open session", 1000, 0, 0.0, 1102.138000000001, 188, 5955, 936.0, 1920.0, 2432.6999999999953, 4178.630000000002, 0.3105556306064996, 5.2892021408540595, 0.20358680592757533], "isController": false}, {"data": ["3.3 Nurse triage complete", 991, 0, 0.0, 265.59132189707395, 162, 3536, 206.0, 343.8000000000004, 477.9999999999999, 1855.7200000000166, 0.3095521676617004, 7.166390564230669, 0.2091895508026335], "isController": false}, {"data": ["4.3 Vaccination confirm", 991, 0, 0.0, 830.2694248234111, 476, 8475, 650.0, 1012.000000000001, 1682.3999999999996, 4305.6, 0.3098729395872843, 7.492508700519217, 0.7207462629980128], "isController": false}, {"data": ["4.1 Vaccination questions", 995, 4, 0.4020100502512563, 437.13969849246183, 115, 5147, 421.0, 495.79999999999995, 800.3999999999988, 2173.3599999999924, 0.3061787172865734, 3.5536309117686793, 0.623762207145442], "isController": false}, {"data": ["3.1 Nurse triage new", 991, 0, 0.0, 227.21089808274454, 120, 4147, 142.0, 311.0, 365.5999999999998, 2059.4000000000015, 0.3094604334069876, 3.4852695267464684, 0.212754047967304], "isController": false}, {"data": ["3.2 Nurse triage result", 991, 0, 0.0, 808.7255297679103, 476, 5295, 758.0, 1045.8000000000004, 1283.4, 3157.6400000000053, 0.30940062760559195, 24.476540886738764, 0.5074433232530963], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1283.5285714285712, 1140, 2229, 1213.0, 1506.8, 1812.900000000001, 2229.0, 0.07884143635581366, 3.7084732651505083, 0.3753437521822183], "isController": true}, {"data": ["3.2 Nurse triage result-1", 991, 0, 0.0, 428.46417759838545, 226, 4767, 386.0, 544.6000000000001, 751.8, 1903.840000000001, 0.30947125695919975, 24.252744861812964, 0.21980612726544826], "isController": false}, {"data": ["3.2 Nurse triage result-0", 991, 0, 0.0, 380.1735620585268, 184, 4540, 359.0, 475.80000000000007, 611.4, 2502.08, 0.3094319285664996, 0.2293543298652082, 0.2877164657440745], "isController": false}, {"data": ["4.0 Vaccination", 995, 4, 0.4020100502512563, 1620.25527638191, 116, 9184, 1355.0, 2282.0, 3204.3999999999996, 6270.9199999999955, 0.3052503052503053, 16.768630778376775, 1.820171487109694], "isController": true}, {"data": ["2.5 Patient return to consent page", 995, 0, 0.0, 329.905527638191, 162, 4855, 216.0, 472.4, 545.1999999999996, 2160.079999999998, 0.3091592546123764, 6.9874764503957865, 0.21435846755350318], "isController": false}, {"data": ["1.5 Open Sessions list", 1065, 0, 0.0, 197.2150234741781, 118, 3605, 136.0, 298.0, 312.0, 933.7799999999781, 0.312173902847964, 3.676884220946576, 0.20166813120317392], "isController": false}, {"data": ["4.2 Vaccination batch", 991, 0, 0.0, 357.6175580221999, 232, 4162, 265.0, 458.2000000000003, 631.5999999999996, 1620.4800000000055, 0.3106536327980018, 6.002832015576255, 0.5018724076604804], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 991, 0, 0.0, 364.3884964682143, 189, 4451, 275.0, 466.80000000000007, 644.8, 2532.6400000000003, 0.3099012350080196, 0.23363647795526477, 0.2971189817477241], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 991, 0, 0.0, 152.00706357214938, 103, 2668, 116.0, 149.80000000000007, 219.39999999999998, 1333.920000000003, 0.30992013380043393, 0.23153213120833202, 0.20913555903916003], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 991, 0, 0.0, 313.7194752774973, 166, 5634, 233.0, 354.80000000000007, 538.199999999999, 2869.840000000002, 0.3099145123803186, 7.028339481814961, 0.21457948171645105], "isController": false}, {"data": ["2.2 Session register", 1000, 0, 0.0, 528.2319999999997, 331, 4082, 471.0, 646.6999999999999, 819.9499999999999, 2092.330000000001, 0.3104643242340379, 12.7325885324918, 0.2062556397784899], "isController": false}, {"data": ["4.1 Vaccination questions-0", 991, 0, 0.0, 269.0625630676082, 120, 4775, 288.0, 331.0, 374.4, 1495.4400000000069, 0.31080104185778107, 0.23188671482357887, 0.4118635081432382], "isController": false}, {"data": ["4.1 Vaccination questions-1", 991, 0, 0.0, 168.82946518668012, 116, 4848, 133.0, 178.0, 233.39999999999998, 1123.8800000000047, 0.3108134216198178, 3.38446328220463, 0.22227706144806436], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 4, 100.0, 0.01634988759452279], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 24465, 4, "422/Unprocessable Entity", 4, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 995, 4, "422/Unprocessable Entity", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
