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

    var data = {"OkPercent": 94.180407371484, "KoPercent": 5.819592628516004};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6608662026295437, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.9074074074074074, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.5, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4827586206896552, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.5, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9259259259259259, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.18877551020408162, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9385964912280702, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.5, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9782608695652174, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.9375, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.9918032786885246, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.5948275862068966, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.9782608695652174, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.42592592592592593, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.9888888888888889, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.20535714285714285, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.9743589743589743, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.8913043478260869, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9910714285714286, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.782608695652174, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.5375, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.6956521739130435, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1031, 60, 5.819592628516004, 426.28516003879724, 0, 2743, 329.0, 837.8000000000004, 927.4, 1199.1999999999966, 1.7195542168272806, 58.76786287795586, 2.0021979277161788], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 98, 58, 59.183673469387756, 1558.9897959183677, 88, 4548, 255.0, 3837.5, 3942.05, 4548.0, 0.24691606869305815, 21.738032837947472, 0.5190694830950677], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 212.0, 212, 212, 212.0, 212.0, 212.0, 212.0, 4.716981132075471, 71.50556456367924, 2.865197523584906], "isController": false}, {"data": ["1.4 Select Organisations", 27, 2, 7.407407407407407, 299.77777777777777, 86, 629, 294.0, 346.9999999999999, 567.3999999999996, 629.0, 0.08880410472306276, 1.2111025944365872, 0.12378870790027627], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 211.0, 211, 211, 211.0, 211.0, 211.0, 211.0, 4.739336492890995, 54.201532879146924, 2.8787766587677726], "isController": false}, {"data": ["2.3 Search by first/last name", 40, 0, 0.0, 796.275, 663, 1135, 747.5, 1017.8, 1053.35, 1135.0, 0.10171362021659916, 4.778186036118506, 0.0878223606586974], "isController": false}, {"data": ["5.8 Consent confirm", 23, 0, 0.0, 751.3478260869566, 646, 1006, 718.0, 949.0000000000001, 998.1999999999999, 1006.0, 0.08574954422253125, 7.240080286506004, 0.18632103114758988], "isController": false}, {"data": ["1.2 Sign-in page", 27, 0, 0.0, 103.2962962962963, 86, 292, 88.0, 131.19999999999987, 292.0, 292.0, 0.08819177464715125, 0.5889690922534958, 0.057725931198983504], "isController": false}, {"data": ["3.0 Nurse triage", 58, 0, 0.0, 1220.3448275862072, 683, 2481, 1230.5, 1387.2, 1483.9499999999996, 2481.0, 0.12757037815819167, 15.151871383902158, 0.3799553290600922], "isController": true}, {"data": ["2.4 Patient attending session", 39, 0, 0.0, 942.1794871794873, 833, 1349, 912.0, 1075.0, 1250.0, 1349.0, 0.09883601584417362, 4.2054061479169675, 0.14690275011214085], "isController": false}, {"data": ["5.4 Consent route", 23, 0, 0.0, 326.04347826086956, 310, 386, 319.0, 352.0, 379.19999999999993, 386.0, 0.08435135640648551, 0.9635545122932934, 0.13122237378469867], "isController": false}, {"data": ["1.1 Homepage", 27, 0, 0.0, 275.11111111111114, 255, 553, 262.0, 289.0, 453.7999999999995, 553.0, 0.08817593384845496, 0.5152366533885685, 0.052721222600144994], "isController": false}, {"data": ["1.3 Sign-in", 27, 0, 0.0, 444.11111111111103, 401, 595, 427.0, 550.5999999999999, 592.6, 595.0, 0.08914274394572197, 0.8990397809812305, 0.14049461326080856], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 2743.0, 2743, 2743, 2743.0, 2743.0, 2743.0, 2743.0, 0.36456434560699963, 3622.9155036684288, 0.22820873587313162], "isController": false}, {"data": ["2.1 Open session", 98, 58, 59.183673469387756, 452.3673469387756, 88, 1793, 254.5, 1043.7, 1223.8999999999999, 1793.0, 0.2501761444282199, 2.414162897537552, 0.1539194568433387], "isController": false}, {"data": ["3.3 Nurse triage complete", 57, 0, 0.0, 329.2982456140352, 235, 1785, 268.0, 503.4, 517.3999999999999, 1785.0, 0.12537530106569006, 3.0299224412165806, 0.08488093470586294], "isController": false}, {"data": ["4.3 Vaccination confirm", 48, 0, 0.0, 792.8541666666667, 640, 1229, 741.5, 932.5, 1030.8999999999999, 1229.0, 0.12882205648310416, 3.220569758317745, 0.2998299817233707], "isController": false}, {"data": ["5.6 Consent questions", 23, 0, 0.0, 346.4782608695652, 314, 503, 324.0, 487.6, 499.99999999999994, 503.0, 0.08515143998489487, 1.0266620033912486, 0.1651472263769543], "isController": false}, {"data": ["4.1 Vaccination questions", 56, 0, 0.0, 381.0178571428571, 326, 563, 342.0, 506.8, 521.35, 563.0, 0.13776578340758744, 1.6035356758026702, 0.2791232214990885], "isController": false}, {"data": ["5.3 Consent parent details", 23, 0, 0.0, 324.608695652174, 310, 373, 318.0, 361.40000000000003, 371.4, 373.0, 0.08383085121117356, 0.9517108099882636, 0.13928265279995042], "isController": false}, {"data": ["3.1 Nurse triage new", 61, 0, 0.0, 222.27868852459017, 196, 601, 215.0, 228.8, 252.79999999999998, 601.0, 0.12674139560976116, 1.4288456955972948, 0.08731326421425528], "isController": false}, {"data": ["3.2 Nurse triage result", 58, 0, 0.0, 673.9310344827588, 453, 982, 752.5, 822.1, 866.7999999999997, 982.0, 0.1267576699317694, 10.615850278293186, 0.20588944067631776], "isController": false}, {"data": ["5.2 Consent who", 23, 0, 0.0, 346.4347826086957, 321, 577, 332.0, 375.80000000000007, 540.1999999999995, 577.0, 0.08406740012427355, 1.2617070422438688, 0.13086273027157427], "isController": false}, {"data": ["1.0 Login", 27, 2, 7.407407407407407, 1435.037037037037, 1191, 4828, 1281.0, 1484.6, 3542.799999999993, 4828.0, 0.08789920890711984, 36.506244251961455, 0.4257872269427353], "isController": true}, {"data": ["5.0 Consent", 23, 0, 0.0, 3725.2608695652175, 3277, 3993, 3735.0, 3957.2000000000003, 3991.2, 3993.0, 0.08257667962761508, 16.942562954620524, 1.2322059036042925], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 45, 0, 0.0, 268.37777777777785, 237, 524, 254.0, 289.6, 440.79999999999916, 524.0, 0.12958590105396534, 2.937702252994874, 0.09363481253239647], "isController": false}, {"data": ["4.0 Vaccination", 56, 0, 0.0, 1421.4642857142853, 654, 1894, 1520.0, 1655.0, 1718.55, 1894.0, 0.13008099865040962, 6.625774025495876, 0.7309162028659631], "isController": true}, {"data": ["2.5 Patient return to consent page", 39, 0, 0.0, 306.3589743589744, 233, 532, 272.0, 483.0, 514.0, 532.0, 0.0987791905171977, 2.259148551871739, 0.06848947780001013], "isController": false}, {"data": ["5.5 Consent agree", 23, 0, 0.0, 383.5217391304348, 319, 575, 335.0, 570.0, 574.4, 575.0, 0.08486521190474433, 1.4775382193249158, 0.13044711283014412], "isController": false}, {"data": ["Debug Sampler", 48, 0, 0.0, 0.33333333333333326, 0, 1, 0.0, 1.0, 1.0, 1.0, 0.12919062076093277, 0.5243953273367353, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 49, 0, 0.0, 215.9795918367347, 197, 478, 209.0, 222.0, 237.5, 478.0, 0.11204353691720212, 1.2134402582146206, 0.06980390951912743], "isController": false}, {"data": ["4.2 Vaccination batch", 56, 0, 0.0, 360.8571428571429, 311, 536, 327.0, 486.3, 490.05, 536.0, 0.138095660837057, 2.467422004464682, 0.2206607021979404], "isController": false}, {"data": ["5.7 Consent triage", 23, 0, 0.0, 451.5217391304347, 331, 655, 363.0, 587.8, 642.1999999999998, 655.0, 0.08438416072614405, 1.3803897229723037, 0.13943880634935776], "isController": false}, {"data": ["2.2 Session register", 40, 0, 0.0, 691.35, 423, 1060, 716.0, 927.1999999999998, 1010.2999999999998, 1060.0, 0.10176433923142482, 8.24486427976289, 0.06494681620724307], "isController": false}, {"data": ["5.1 Consent homepage", 23, 0, 0.0, 537.1739130434783, 411, 752, 578.0, 653.6, 736.3999999999997, 752.0, 0.08423859299574411, 1.0628898896291306, 0.17941833137081828], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 0.14544547872340424, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 2, 3.3333333333333335, 0.19398642095053345], "isController": false}, {"data": ["404/Not Found", 58, 96.66666666666667, 5.62560620756547], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1031, 60, "404/Not Found", 58, "422/Unprocessable Entity", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Select Organisations", 27, 2, "422/Unprocessable Entity", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 98, 58, "404/Not Found", 58, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
